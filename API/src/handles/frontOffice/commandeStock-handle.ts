import {Request, Response} from "express";
import {In} from "typeorm";
import {generateValidationErrorMessage} from "../../services/validators";
import {AppDataSource} from "../../services/db/database";

import {
    CreateCommandeStockFranchiseeValidation,
    GetCommandeStockFranchiseeValidation,
    ListCommandeStocksFranchiseeValidation,
    UpdateCommandeStockFranchiseeValidation,
} from "../../services/validators/frontOffice/commandesStock-valid";

import {CommandeStockProduit} from "../../services/db/models/commande_stock_produit";
import {CommandeStock} from "../../services/db/models/commandes_stock";
import {Produit} from "../../services/db/models/produit";
import {Entrepot} from "../../services/db/models/entrepot";
import {Franchise} from "../../services/db/models/franchise";
import {StatutCommande} from "../../services/enums";
import {upsertStock} from "../../services/services/stock/upertStock-service";

export async function createCommandeStock(req: Request, res: Response) {
    try {
        const {error, value} = CreateCommandeStockFranchiseeValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const {entrepotId, lignes} = value;

        const repoFranchise = AppDataSource.getRepository(Franchise);
        const repoEntrepot = AppDataSource.getRepository(Entrepot);
        const repoProduit = AppDataSource.getRepository(Produit);
        const repoCommande = AppDataSource.getRepository(CommandeStock);
        const repoCommandeProduit = AppDataSource.getRepository(CommandeStockProduit);

        const franchiseTrouvee = await repoFranchise.findOne({where: {id: franchiseId}});
        if (!franchiseTrouvee) {
            return res.status(404).json({success: false, message: "franchise not found"});
        }

        if (entrepotId != null) {
            const entrepotTrouve = await repoEntrepot.findOne({where: {id: entrepotId}});
            if (!entrepotTrouve) {
                return res.status(404).json({success: false, message: "entrepot not found"});
            }
        }

        const produits = await repoProduit.findBy({
            id: In(lignes.map((ligne: any) => ligne.produitId)),
        });

        const prixParProduit = new Map<string, number>(produits.map((p) => [p.id, Number(p.prix)]));
        for (const ligne of lignes) {
            if (!prixParProduit.has(ligne.produitId)) {
                return res.status(404).json({success: false, message: "PRODUIT_NOT_FOUND"});
            }
        }

        const montantTotal = lignes.reduce((somme: number, ligne: any) => {
            const prixUnitaire = prixParProduit.get(ligne.produitId)!;
            const quantite = Number(ligne.quantite);
            return somme + prixUnitaire * quantite;
        }, 0);

        if (entrepotId == null) {
            const maintenant = new Date();
            const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1, 0, 0, 0, 0);
            const debutMoisSuivant = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1, 0, 0, 0, 0);

            const sommeDirecteRow = await repoCommande
                .createQueryBuilder("c")
                .leftJoin("c.franchise", "f")
                .where("f.id = :fid", {fid: franchiseId})
                .andWhere("c.statut = :statut", {statut: StatutCommande.LIVREE})
                .andWhere("c.entrepot IS NULL")
                .andWhere("c.date_reception >= :from AND c.date_reception < :to", {
                    from: debutMois,
                    to: debutMoisSuivant,
                })
                .select("COALESCE(SUM(c.montant_total), 0)", "sum")
                .getRawOne<{ sum: string }>();

            const sommeTotaleRow = await repoCommande
                .createQueryBuilder("c")
                .leftJoin("c.franchise", "f")
                .where("f.id = :fid", {fid: franchiseId})
                .andWhere("c.statut = :statut", {statut: StatutCommande.LIVREE})
                .andWhere("c.date_reception >= :from AND c.date_reception < :to", {
                    from: debutMois,
                    to: debutMoisSuivant,
                })
                .select("COALESCE(SUM(c.montant_total), 0)", "sum")
                .getRawOne<{ sum: string }>();

            const sommeDirecteLivree = Number(sommeDirecteRow?.sum ?? 0);
            const sommeTotaleLivree = Number(sommeTotaleRow?.sum ?? 0);

            const directApres = sommeDirecteLivree + Number(montantTotal);
            const totalApres = sommeTotaleLivree + Number(montantTotal);

            if (totalApres > 0 && directApres / totalApres > 0.2) {
                return res.status(409).json({
                    success: false,
                    message: "Quota dépassé : 20 % d’achats externes",
                });
            }
        }

        const commandeCree = await repoCommande.save(
            repoCommande.create({
                franchise: {id: franchiseId},
                entrepot: entrepotId != null ? {id: entrepotId} : undefined,
                statut: StatutCommande.EN_COURS,
                montant_total: montantTotal,
                date_commande: new Date(),
            })
        );

        const lignesAInserer = lignes.map((ligne: any) =>
            repoCommandeProduit.create({
                commande: commandeCree,
                produit: {id: ligne.produitId},
                quantite: Number(ligne.quantite),
                prix_unitaire: prixParProduit.get(ligne.produitId)!,
            })
        );
        await repoCommandeProduit.save(lignesAInserer);

        return res.status(201).json({success: true, data: commandeCree});
    } catch (e) {
        console.error(e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function getCommandeStock(req: Request, res: Response) {
    try {
        const {error, value} = GetCommandeStockFranchiseeValidation.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }
        const commandeId = value.id;

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const commande = await AppDataSource.getRepository(CommandeStock)
            .createQueryBuilder("c")
            .leftJoinAndSelect("c.franchise", "f")
            .leftJoinAndSelect("c.entrepot", "e")
            .leftJoinAndSelect("c.produits", "l")
            .leftJoinAndSelect("l.produit", "p")
            .select([
                "c.id",
                "c.id_formatted",
                "c.date_commande",
                "c.date_reception",
                "c.statut",
                "c.montant_total",
                "e.id",
                "e.nom",
                "f.id",
                "l.id",
                "l.quantite",
                "l.prix_unitaire",
                "p.id",
                "p.nom",
            ])
            .where("c.id = :id", {id: commandeId})
            .andWhere("f.id = :fid", {fid: franchiseId})
            .getOne();

        if (!commande) {
            return res.status(404).json({success: false, message: "COMMANDE_STOCK_NOT_FOUND"});
        }

        return res.status(200).json({success: true, data: commande});
    } catch (e) {
        console.error(e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function listCommandeStocks(req: Request, res: Response) {
    try {
        const {error, value} = ListCommandeStocksFranchiseeValidation.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const {page, limit, statut, from, to} = value;
        const offset = (page - 1) * limit;

        const builder = AppDataSource.getRepository(CommandeStock)
            .createQueryBuilder("c")
            .leftJoin("c.franchise", "f")
            .leftJoin("c.entrepot", "e")
            .select([
                "c.id",
                "c.id_formatted",
                "c.date_commande",
                "c.date_reception",
                "c.statut",
                "c.montant_total",
                "e.id",
                "e.nom",
            ])
            .where("f.id = :fid", {fid: franchiseId});

        if (statut) builder.andWhere("c.statut = :statut", {statut});
        if (from) builder.andWhere("c.date_commande >= :from", {from});
        if (to) builder.andWhere("c.date_commande < :to", {to});

        builder.orderBy("c.date_commande", "DESC").skip(offset).take(limit);

        const [rows, total] = await builder.getManyAndCount();

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function soumettreCommandeStock(req: Request, res: Response) {
    try {
        const {error, value} = GetCommandeStockFranchiseeValidation.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }
        const commandeId = value.id;

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const repoCommande = AppDataSource.getRepository(CommandeStock);
        const commande = await repoCommande
            .createQueryBuilder("c")
            .leftJoin("c.franchise", "f")
            .where("c.id = :id", {id: commandeId})
            .andWhere("f.id = :fid", {fid: franchiseId})
            .andWhere("c.statut = :s", {s: StatutCommande.EN_COURS})
            .getOne();

        if (!commande) {
            return res.status(404).json({success: false, message: "COMMANDE_STOCK_NOT_FOUND"});
        }

        if (commande.statut !== StatutCommande.EN_COURS) {
            return res.status(409).json({success: false, message: "COMMANDE_STOCK_NON_SOUMISSABLE"});
        }
        commande.statut = StatutCommande.SOUMISE;

        await repoCommande.save(commande);

        return res.status(200).json({success: true, data: commande});
    } catch (e) {
        console.error(e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function receptionnerCommandeStock(req: Request, res: Response) {
    try {
        const {error, value} = GetCommandeStockFranchiseeValidation.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }
        const commandeId = value.id;

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const repoCommande = AppDataSource.getRepository(CommandeStock);
        const commande = await repoCommande
            .createQueryBuilder("c")
            .leftJoin("c.franchise", "f")
            .leftJoinAndSelect("c.produits", "l")
            .leftJoinAndSelect("l.produit", "p")
            .where("c.id = :id", {id: commandeId})
            .andWhere("f.id = :fid", {fid: franchiseId})
            .getOne();

        if (!commande) {
            return res.status(404).json({success: false, message: "COMMANDE_STOCK_NOT_FOUND"});
        }

        if (commande.statut !== StatutCommande.VALIDE) {
            return res.status(409).json({success: false, message: "COMMANDE_STOCK_NON_RECEPTIONNABLE"});
        }

        if (commande.produits && Array.isArray(commande.produits)) {
            for (let i = 0; i < commande.produits.length; i++) {
                const ligne = commande.produits[i];
                const produitId = ligne.produit.id;
                const quantite = Number(ligne.quantite);
                await upsertStock(franchiseId, produitId, quantite);
            }
        }

        commande.statut = StatutCommande.LIVREE;
        commande.date_reception = new Date();

        await repoCommande.save(commande);

        return res.status(200).json({success: true, data: commande});
    } catch (e) {
        console.error(e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function updateCommandeStock(req: Request, res: Response) {
    try {
        const {error, value} = UpdateCommandeStockFranchiseeValidation.validate({
            ...req.params,
            ...req.body,
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const {id, entrepotId, lignes} = value;

        const data = await AppDataSource.transaction(async (manager) => {
            const repoCmd = manager.getRepository(CommandeStock);
            const repoEnt = manager.getRepository(Entrepot);
            const repoLigne = manager.getRepository(CommandeStockProduit);
            const repoProd = manager.getRepository(Produit);

            const cmd = await repoCmd
                .createQueryBuilder("c")
                .leftJoinAndSelect("c.franchise", "f")
                .leftJoinAndSelect("c.entrepot", "e")
                .leftJoinAndSelect("c.produits", "l")
                .leftJoinAndSelect("l.produit", "p")
                .where("c.id = :id", {id})
                .andWhere("f.id = :fid", {fid: franchiseId})
                .getOne();

            if (!cmd) throw new Error("COMMANDE_STOCK_NOT_FOUND");

            if (cmd.statut !== StatutCommande.EN_COURS) {
                throw new Error("COMMANDE_STOCK_NON_EDITABLE");
            }

            if (entrepotId !== undefined) {
                if (entrepotId === null) {
                    // @ts-expect-error: Explicitly allow null for entrepot removal
                    cmd.entrepot = null;
                } else {
                    const ent = await repoEnt.findOne({where: {id: entrepotId}});
                    if (!ent) throw new Error("ENTREPOT_NOT_FOUND");
                    cmd.entrepot = ent;
                }
            }

            const seraDirect = cmd.entrepot == null;

            let nouveauTotal = Number(cmd.montant_total ?? 0);
            let nouvellesLignes: CommandeStockProduit[] | null = null;

            if (lignes && Array.isArray(lignes)) {
                const mapQte = new Map<string, number>();
                for (const l of lignes) {
                    mapQte.set(l.produitId, (mapQte.get(l.produitId) ?? 0) + Number(l.quantite));
                }

                const produitIds = Array.from(mapQte.keys());
                const produits = await repoProd.findBy({id: In(produitIds)});
                if (produits.length !== produitIds.length) throw new Error("PRODUIT_NOT_FOUND");

                const prix = new Map<string, number>(produits.map(p => [p.id, Number(p.prix)]));

                nouveauTotal = produitIds.reduce(
                    (s, pid) => s + (prix.get(pid) ?? 0) * (mapQte.get(pid) ?? 0),
                    0
                );

                nouvellesLignes = [];
                for (const pid of produitIds) {
                    const l = repoLigne.create({
                        commande: {id: cmd.id},
                        produit: {id: pid},
                        quantite: mapQte.get(pid)!,
                        prix_unitaire: prix.get(pid)!,
                    });
                    nouvellesLignes.push(l);
                }
            }

            if (seraDirect) {
                const maintenant = new Date();
                const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1, 0, 0, 0, 0);
                const debutMoisSuivant = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1, 0, 0, 0, 0);

                const directSumRow = await repoCmd
                    .createQueryBuilder("c")
                    .leftJoin("c.franchise", "f")
                    .where("f.id = :fid", {fid: franchiseId})
                    .andWhere("c.statut = :s", {s: StatutCommande.LIVREE})
                    .andWhere("c.entrepot IS NULL")
                    .andWhere("c.date_reception >= :from AND c.date_reception < :to", {
                        from: debutMois, to: debutMoisSuivant,
                    })
                    .select("COALESCE(SUM(c.montant_total), 0)", "sum")
                    .getRawOne<{ sum: string }>();

                const totalSumRow = await repoCmd
                    .createQueryBuilder("c")
                    .leftJoin("c.franchise", "f")
                    .where("f.id = :fid", {fid: franchiseId})
                    .andWhere("c.statut = :s", {s: StatutCommande.LIVREE})
                    .andWhere("c.date_reception >= :from AND c.date_reception < :to", {
                        from: debutMois, to: debutMoisSuivant,
                    })
                    .select("COALESCE(SUM(c.montant_total), 0)", "sum")
                    .getRawOne<{ sum: string }>();

                const directAvant = Number(directSumRow?.sum ?? 0);
                const totalAvant = Number(totalSumRow?.sum ?? 0);

                const montantCommandeFinale = nouvellesLignes ? nouveauTotal : Number(cmd.montant_total ?? 0);

                const directApres = directAvant + montantCommandeFinale;
                const totalApres = totalAvant + montantCommandeFinale;

                if (totalApres > 0 && directApres / totalApres > 0.20) {
                    throw new Error("QUOTA_20_EXCEEDED");
                }
            }

            if (nouvellesLignes) {
                if (cmd.produits?.length) {
                    await repoLigne.remove(cmd.produits);
                }
                const lignesCreees: CommandeStockProduit[] = [];
                for (const l of nouvellesLignes) {
                    lignesCreees.push(await repoLigne.save(l));
                }
                cmd.produits = lignesCreees;
                cmd.montant_total = nouveauTotal;
            }

            const saved = await repoCmd.save(cmd);
            return saved;
        });

        res.status(200).json({success: true, data});
    } catch (e: any) {
        const msg = e?.message;
        if (msg === "COMMANDE_STOCK_NOT_FOUND") {
            res.status(404).json({success: false, message: msg});
            return;
        }
        if (msg === "COMMANDE_STOCK_NON_EDITABLE") {
            res.status(409).json({success: false, message: msg});
            return;
        }
        if (msg === "ENTREPOT_NOT_FOUND") {
            res.status(404).json({success: false, message: msg});
            return;
        }
        if (msg === "PRODUIT_NOT_FOUND") {
            res.status(404).json({success: false, message: msg});
            return;
        }
        if (msg === "QUOTA_20_EXCEEDED") {
            res.status(409).json({success: false, message: msg});
            return;
        }

        console.error(e);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}


export async function supprimerCommandeStock(req: Request, res: Response) {
    try {
        const {error, value} = GetCommandeStockFranchiseeValidation.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }
        const commandeId = value.id as number;

        const franchiseId = res.locals?.user?.franchiseId as string | undefined;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const repoCommande = AppDataSource.getRepository(CommandeStock);
        const repoCommandeProduit = AppDataSource.getRepository(CommandeStockProduit);

        const commande = await repoCommande
            .createQueryBuilder("c")
            .leftJoin("c.franchise", "f")
            .leftJoinAndSelect("c.produits", "l")
            .where("c.id = :id", {id: commandeId})
            .andWhere("f.id = :fid", {fid: franchiseId})
            .getOne();

        if (!commande) {
            return res.status(404).json({success: false, message: "COMMANDE_STOCK_NOT_FOUND"});
        }

        if (commande.statut !== StatutCommande.EN_COURS) {
            return res.status(409).json({success: false, message: "COMMANDE_STOCK_NON_SUPPRIMABLE"});
        }

        const lignes = commande.produits ?? [];
        if (lignes.length > 0) {
            await repoCommandeProduit.remove(lignes);
        }
        await repoCommande.remove(commande);

        return res.status(204).send();
    } catch (e) {
        console.error("Erreur supprimerCommandeStock:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}
