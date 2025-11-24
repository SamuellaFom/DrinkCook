import {Request, Response} from "express";
import {In, QueryFailedError} from "typeorm";
import {AppDataSource} from "../../services/db/database";
import {generateValidationErrorMessage} from "../../services/validators";

import {Franchise} from "../../services/db/models/franchise";
import {Produit} from "../../services/db/models/produit";
import {Stock} from "../../services/db/models/stock";
import {Menu} from "../../services/db/models/menu";
import {CommandeClient} from "../../services/db/models/commandeClient";
import {CommandeClientProduit} from "../../services/db/models/commandeClientProduit";
import {CommandeClientMenu} from "../../services/db/models/CommandeClientMenu";
import {Vente} from "../../services/db/models/vente";
import {CarteFidelite} from "../../services/db/models/carteFidelite";
import {StatutCommandeClient} from "../../services/enums";

import {
    CreateCommandeClientValidation,
    GetCommandeClientValidation,
    ListCommandeClientsValidation,
    TransitionValidation,
} from "../../services/validators/frontOffice/commandeClient-validator";

import {upsertStock} from "../../services/services/stock/upertStock-service";

const THRESHOLD_POINTS = 100;
const DISCOUNT_EURO = 5;
const EARN_DIVISOR = 1;

import {ArticlePrixFranchise} from "../../services/db/models/articlePrixFranchise";

export async function createCommandeClient(req: Request, res: Response) {
    try {
        const {error, value} = CreateCommandeClientValidation.validate(req.body);
        if (error) {
            res.status(400).json({success: false, message: generateValidationErrorMessage(error.details)});
            return;
        }

        const franchiseId = res.locals?.user?.franchiseId as string | undefined;
        if (!franchiseId) {
            res.status(401).json({success: false, message: "UNAUTHORIZED"});
            return;
        }

        const {clientId, lignes = [], menus = [], utiliserPointsFidelite = false} = value;

        const created = await AppDataSource.transaction(async (manager) => {
            const franchiseRepo = manager.getRepository(Franchise);
            const produitRepo = manager.getRepository(Produit);
            const menuRepo = manager.getRepository(Menu);
            const commandeRepo = manager.getRepository(CommandeClient);
            const ligneProdRepo = manager.getRepository(CommandeClientProduit);
            const ligneMenuRepo = manager.getRepository(CommandeClientMenu);

            const franchise = await franchiseRepo.findOne({where: {id: franchiseId}});
            if (!franchise) throw new Error("FRANCHISE_NOT_FOUND");

            const quantitesParProduit = new Map<string, number>();
            for (const ligne of lignes) {
                quantitesParProduit.set(
                    ligne.produitId,
                    (quantitesParProduit.get(ligne.produitId) ?? 0) + Number(ligne.quantite)
                );
            }
            const produitIds = Array.from(quantitesParProduit.keys());

            const produitsTrouves = produitIds.length ? await produitRepo.findBy({id: In(produitIds)}) : [];
            if (produitsTrouves.length !== produitIds.length) throw new Error("PRODUIT_NOT_FOUND");

            const apfRepo = manager.getRepository(ArticlePrixFranchise);
            const apfs = produitIds.length
                ? await apfRepo.find({
                    where: {
                        franchise: {id: franchiseId} as any,
                        produit: {id: In(produitIds)} as any,
                        actif: true,
                    },
                    relations: ["produit"],
                })
                : [];

            if (apfs.length !== produitIds.length) {
                throw new Error("ARTICLE_PRIX_FRANCHISE_NOT_FOUND");
            }

            const prixProduitMap = new Map<string, number>();
            for (const apf of apfs) {
                if (apf.prix_vente == null) {
                    throw new Error("ARTICLE_PRIX_FRANCHISE_NO_PRICE");
                }
                prixProduitMap.set(apf.produit.id, Number(apf.prix_vente));
            }


            const quantitesParMenu = new Map<string, number>();
            for (const item of menus) {
                quantitesParMenu.set(item.menuId, (quantitesParMenu.get(item.menuId) ?? 0) + Number(item.quantite));
            }
            const menuIds = Array.from(quantitesParMenu.keys());

            const menusTrouves = menuIds.length
                ? await menuRepo.find({
                    where: {id: In(menuIds), franchise: {id: franchiseId} as any},
                })
                : [];
            if (menusTrouves.length !== menuIds.length) throw new Error("MENU_NOT_FOUND");

            const prixMenuMap = new Map<string, number>(menusTrouves.map(m => [m.id, Number(m.prix)]));

            const totalProduits = produitIds.reduce((sum, pid) => {
                const q = quantitesParProduit.get(pid) ?? 0;
                const pu = prixProduitMap.get(pid) ?? 0;
                return sum + q * pu;
            }, 0);

            const totalMenus = menuIds.reduce((sum, mid) => {
                const q = quantitesParMenu.get(mid) ?? 0;
                const pu = prixMenuMap.get(mid) ?? 0;
                return sum + q * pu;
            }, 0);

            const montantTotal = totalProduits + totalMenus;

            const commande = await commandeRepo.save(
                commandeRepo.create({
                    statut: StatutCommandeClient.EN_ATTENTE,
                    montantTotal,
                    utiliserPointsFidelite: !!utiliserPointsFidelite,
                    franchise: {id: franchiseId} as any,
                    client: clientId ? ({id: clientId} as any) : null,
                })
            );

            for (const produitId of produitIds) {
                await ligneProdRepo.save(ligneProdRepo.create({
                    commandeClient: {id: commande.id} as any,
                    produit: {id: produitId} as any,
                    quantite: quantitesParProduit.get(produitId)!,
                    prixUnitaire: prixProduitMap.get(produitId)!,
                }));
            }

            for (const menuId of menuIds) {
                await ligneMenuRepo.save(ligneMenuRepo.create({
                    commandeClient: {id: commande.id} as any,
                    menu: {id: menuId} as any,
                    quantite: quantitesParMenu.get(menuId)!,
                    prixUnitaire: prixMenuMap.get(menuId)!,
                }));
            }

            return commande;
        });

        res.status(201).json({success: true, data: created});
    } catch (err: any) {
        const msg = err?.message;
        if (msg === "FRANCHISE_NOT_FOUND") {
            res.status(404).json({success: false, message: msg});
            return;
        }
        if (msg === "PRODUIT_NOT_FOUND") {
            res.status(400).json({success: false, message: msg});
            return;
        }
        if (msg === "MENU_NOT_FOUND") {
            res.status(400).json({success: false, message: msg});
            return;
        }
        if (err instanceof QueryFailedError && (err as any).driverError?.code === "23505") {
            res.status(400).json({success: false, message: "Duplicate or constraint error"});
            return;
        }
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}


export async function getCommandeClient(req: Request, res: Response) {
    try {
        const {error, value} = GetCommandeClientValidation.validate(req.params);
        if (error) {
            res.status(400).json({success: false, message: generateValidationErrorMessage(error.details)});
            return;
        }

        const franchiseId = res.locals?.user?.franchiseId as string | undefined;
        if (!franchiseId) {
            res.status(401).json({success: false, message: "UNAUTHORIZED"});
            return;
        }

        const commandeId = value.id;

        const commande = await AppDataSource.getRepository(CommandeClient).findOne({
            where: {id: commandeId, franchise: {id: franchiseId} as any},
            relations: ["client", "franchise", "lignes", "lignes.produit", "menus", "menus.menu"],
        });

        if (!commande) {
            res.status(404).json({success: false, message: "COMMANDE_NOT_FOUND"});
            return;
        }

        const vente = await AppDataSource.getRepository(Vente).findOne({
            where: {commandeClient: {id: commandeId} as any, franchise: {id: franchiseId} as any},
            order: {dateVente: "DESC"},
        });

        res.status(200).json({
            success: true,
            data: vente
                ? {
                    ...commande,
                    vente: {
                        id: vente.id,
                        dateVente: vente.dateVente,
                        remiseFidelite: Number(vente.remiseFidelite ?? 0),
                        montantNet: Number(vente.montant ?? 0),
                    },
                }
                : {...commande, vente: null},
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function listCommandeClients(req: Request, res: Response) {
    try {
        const {error, value} = ListCommandeClientsValidation.validate(req.query);
        if (error) {
            res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
            return;
        }

        const franchiseId = res.locals?.user?.franchiseId as string | undefined;
        if (!franchiseId) {
            res.status(401).json({success: false, message: "UNAUTHORIZED"});
            return;
        }

        const {page, limit, statut, from, to} = value;
        const skip = (page - 1) * limit;

        const qb = AppDataSource.getRepository(CommandeClient)
            .createQueryBuilder("cmd")
            .leftJoin("cmd.client", "client")
            .leftJoin("cmd.franchise", "franchise")
            .select([
                "cmd.id",
                "cmd.dateCommande",
                "cmd.statut",
                "cmd.utiliserPointsFidelite",
                "cmd.montantTotal",
                "client.id",
                "client.nom",
                "franchise.id",
                "franchise.nom",
            ])
            .where("franchise.id = :fid", {fid: franchiseId});

        if (statut) qb.andWhere("cmd.statut = :statut", {statut});
        if (from) qb.andWhere("cmd.dateCommande >= :from", {from});
        if (to) qb.andWhere("cmd.dateCommande < :to", {to});

        qb.orderBy("cmd.dateCommande", "DESC").skip(skip).take(limit);

        const [rows, total] = await qb.getManyAndCount();

        let rowsWithNet = rows;
        if (rows.length) {
            const ids = rows.map(r => r.id);

            const venteRaw = await AppDataSource.getRepository(Vente)
                .createQueryBuilder("v")
                .leftJoin("v.commandeClient", "c")
                .leftJoin("v.franchise", "f")
                .where("c.id IN (:...ids)", {ids})
                .andWhere("f.id = :fid", {fid: franchiseId})
                .select([
                    "v.id AS v_id",
                    "v.montant AS v_montant",
                    "v.remiseFidelite AS v_remise",
                    "v.dateVente AS v_date",
                    "c.id AS c_id",
                ])
                .orderBy("v.dateVente", "DESC")
                .getRawMany();

            const lastSaleByCmd = new Map<string, { montant: number; remise: number }>();
            for (const r of venteRaw) {
                const cmdId = r.c_id as string;
                if (!lastSaleByCmd.has(cmdId)) {
                    lastSaleByCmd.set(cmdId, {
                        montant: Number(r.v_montant ?? 0),
                        remise: Number(r.v_remise ?? 0),
                    });
                }
            }

            rowsWithNet = rows.map(r => ({
                ...r,
                montantNet: lastSaleByCmd.get(r.id)?.montant ?? null,
                remiseFidelite: lastSaleByCmd.get(r.id)?.remise ?? 0,
            })) as any;
        }

        res.status(200).json({
            success: true,
            data: rowsWithNet,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}


export async function payerCommandeClient(req: Request, res: Response) {
    try {
        const {error, value} = TransitionValidation.validate(req.params);
        if (error) {
            res.status(400).json({success: false, message: generateValidationErrorMessage(error.details)});
            return;
        }

        const franchiseId = res.locals?.user?.franchiseId as string | undefined;
        if (!franchiseId) {
            res.status(401).json({success: false, message: "UNAUTHORIZED"});
            return;
        }

        const commandeId = value.id;
        const utiliserPointsRequete: boolean = req.body?.utiliserPoints === true;

        const paid = await AppDataSource.transaction(async (manager) => {
            const commandeRepo = manager.getRepository(CommandeClient);
            const venteRepo = manager.getRepository(Vente);
            const carteRepo = manager.getRepository(CarteFidelite);
            const ligneProdRepo = manager.getRepository(CommandeClientProduit);
            const ligneMenuRepo = manager.getRepository(CommandeClientMenu);

            const commande = await commandeRepo.findOne({
                where: {id: commandeId, franchise: {id: franchiseId} as any},
                relations: ["client", "franchise"],
            });

            if (!commande) throw new Error("COMMANDE_NOT_FOUND");
            if (commande.statut !== StatutCommandeClient.EN_ATTENTE) throw new Error("COMMANDE_NON_PAYABLE");

            const montantBrut = Number(commande.montantTotal);

            const besoinsParProduit = new Map<string, number>();
            const lignesProduits = await ligneProdRepo.find({
                where: {commandeClient: {id: commande.id} as any},
                relations: ["produit"],
            });
            for (const lp of lignesProduits) {
                besoinsParProduit.set(lp.produit.id, (besoinsParProduit.get(lp.produit.id) ?? 0) + Number(lp.quantite));
            }

            const lignesMenus = await ligneMenuRepo.find({
                where: {commandeClient: {id: commande.id} as any},
                relations: ["menu"],
            });

            if (lignesMenus.length > 0) {
                const menuIds = Array.from(new Set(lignesMenus.map(lm => lm.menu.id)));
                const menusAvecCompos = await manager.getRepository(Menu).find({
                    where: {id: In(menuIds)},
                    relations: ["lignes", "lignes.produit"],
                });

                const menuMap = new Map<string, Menu>(menusAvecCompos.map(m => [m.id, m]));
                for (const lm of lignesMenus) {
                    const def = menuMap.get(lm.menu.id);
                    if (!def) continue;
                    for (const comp of def.lignes ?? []) {
                        if (comp.produit?.id) {
                            const q = Number(comp.quantite) * Number(lm.quantite);
                            besoinsParProduit.set(comp.produit.id, (besoinsParProduit.get(comp.produit.id) ?? 0) + q);
                        }
                    }
                }
            }

            if (besoinsParProduit.size > 0) {
                const tousLesProduitIds = Array.from(besoinsParProduit.keys());
                const stocks = await manager.getRepository(Stock).find({
                    where: {franchise: {id: franchiseId} as any, produit: {id: In(tousLesProduitIds)} as any},
                    relations: ["produit", "franchise"],
                });
                const stockMap = new Map<string, number>(stocks.map(s => [s.produit.id, Number(s.quantite)]));

                for (const produitId of tousLesProduitIds) {
                    const dispo = stockMap.get(produitId) ?? 0;
                    const requis = besoinsParProduit.get(produitId)!;
                    if (dispo < requis) throw new Error("STOCK_INSUFFISANT");
                }
            }

            let remise = 0;
            let carte: CarteFidelite | null = null;

            const utiliserPoints = utiliserPointsRequete === true ? true : (commande.utiliserPointsFidelite === true);

            if (commande.client) {
                const clientId = (commande.client as any).id;
                carte =
                    (await carteRepo.findOne({
                        where: {client: {id: clientId} as any, franchise: {id: franchiseId} as any},
                        relations: ["client", "franchise"],
                    })) ??
                    carteRepo.create({client: {id: clientId} as any, franchise: {id: franchiseId} as any, points: 0});

                if (!carte.id) await carteRepo.save(carte);

                if (utiliserPoints && carte.points >= THRESHOLD_POINTS) {
                    remise = Math.min(DISCOUNT_EURO, montantBrut);
                    carte.points -= THRESHOLD_POINTS;
                    await carteRepo.save(carte);
                }
            }

            for (const [produitId, quantite] of besoinsParProduit.entries()) {
                await upsertStock(franchiseId, produitId, -quantite);
            }

            commande.statut = StatutCommandeClient.PAYEE;
            await commandeRepo.save(commande);

            const montantNet = Math.max(0, montantBrut - remise);
            await venteRepo.save(
                venteRepo.create({
                    montant: montantNet,
                    remiseFidelite: remise,
                    franchise: {id: franchiseId} as any,
                    commandeClient: {id: commande.id} as any,
                })
            );

            if (carte) {
                const pointsGagnes = Math.floor(montantNet / EARN_DIVISOR);
                if (pointsGagnes > 0) {
                    carte.points += pointsGagnes;
                    await carteRepo.save(carte);
                }
            }

            return commande;
        });

        res.status(200).json({success: true, data: paid});
    } catch (err: any) {
        const msg = err?.message;
        if (msg === "COMMANDE_NOT_FOUND") {
            res.status(404).json({success: false, message: msg});
            return;
        }
        if (msg === "COMMANDE_NON_PAYABLE") {
            res.status(409).json({success: false, message: msg});
            return;
        }
        if (msg === "STOCK_INSUFFISANT") {
            res.status(409).json({success: false, message: msg});
            return;
        }
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function annulerCommandeClient(req: Request, res: Response) {
    try {
        const {error, value} = TransitionValidation.validate(req.params);
        if (error) {
            res.status(400).json({success: false, message: generateValidationErrorMessage(error.details)});
            return;
        }

        const franchiseId = res.locals?.user?.franchiseId as string | undefined;
        if (!franchiseId) {
            res.status(401).json({success: false, message: "UNAUTHORIZED"});
            return;
        }

        const commandeId = value.id;

        const commandeRepo = AppDataSource.getRepository(CommandeClient);
        const commande = await commandeRepo.findOne({
            where: {id: commandeId, franchise: {id: franchiseId} as any},
        });

        if (!commande) {
            res.status(404).json({success: false, message: "COMMANDE_NOT_FOUND"});
            return;
        }
        if (commande.statut !== StatutCommandeClient.EN_ATTENTE) {
            res.status(409).json({success: false, message: "COMMANDE_NON_ANNULABLE"});
            return;
        }

        commande.statut = StatutCommandeClient.ANNULEE;
        await commandeRepo.save(commande);

        res.status(200).json({success: true, data: commande});
    } catch (err) {
        console.error(err);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}
