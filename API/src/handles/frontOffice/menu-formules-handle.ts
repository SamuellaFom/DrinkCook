import {Request, Response} from "express";
import {In} from "typeorm";
import {AppDataSource} from "../../services/db/database";
import {generateValidationErrorMessage} from "../../services/validators";

import {Franchise} from "../../services/db/models/franchise";
import {Produit} from "../../services/db/models/produit";
import {Stock} from "../../services/db/models/stock";
import {Menu} from "../../services/db/models/menu";
import {MenuLigne} from "../../services/db/models/menuLigne";

import {
    CreateMenuValidation,
    UpdateMenuValidation,
    ListMenusValidation,
    GetMenuValidation,
} from "../../services/validators/frontOffice/menu-formules-valid";

export async function listMenus(req: Request, res: Response) {
    try {
        const {error, value} = ListMenusValidation.validate(req.query);
        if (error) {
            return res
                .status(400)
                .json({success: false, message: generateValidationErrorMessage(error.details)});
        }
        const {q, actifsOnly} = value;

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const menuRepo = AppDataSource.getRepository(Menu);
        const menus = await menuRepo.find({
            where: {franchise: {id: franchiseId}} as any,
            relations: ["lignes", "lignes.produit"],
            order: {createdAt: "DESC"},
        });

        const filtered = menus.filter((menu) => {
            if (actifsOnly === true && !menu.actif) return false;
            if (q && String(q).trim() !== "") {
                const needle = String(q).trim().toLowerCase();
                const inName = menu.nom.toLowerCase().includes(needle);
                const inDesc = (menu.description ?? "").toLowerCase().includes(needle);
                return inName || inDesc;
            }
            return true;
        });

        const allProductIds = Array.from(
            new Set(filtered.flatMap((m) => (m.lignes ?? []).map((l) => l.produit.id)))
        );
        const stockRows = await AppDataSource.getRepository(Stock).find({
            where: {franchise: {id: franchiseId}, produit: {id: In(allProductIds)}} as any,
            relations: ["produit", "franchise"],
        });
        const stockByProduct = new Map<string, number>(
            stockRows.map((s) => [s.produit.id, Number(s.quantite)])
        );

        const data = filtered.map((menu) => {
            let stockDispo = 0;
            if (menu.lignes && menu.lignes.length > 0) {
                const possibleParLigne = menu.lignes.map((ligne) => {
                    const stockProduit = stockByProduct.get(ligne.produit.id) ?? 0;
                    return Math.floor(stockProduit / Number(ligne.quantite));
                });
                stockDispo = Math.min(...possibleParLigne);
            }

            return {
                id: menu.id,
                nom: menu.nom,
                description: menu.description ?? "",
                prix: Number(menu.prix),
                actif: menu.actif,
                stockDispo,
                lignes: (menu.lignes ?? []).map((ligne) => ({
                    produitId: ligne.produit.id,
                    produitNom: ligne.produit.nom,
                    quantite: Number(ligne.quantite),
                })),
            };
        });

        return res.status(200).json({success: true, data});
    } catch (e) {
        console.error("listMenus error:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function createMenu(req: Request, res: Response) {
    try {
        const {error, value} = CreateMenuValidation.validate(req.body);
        if (error) {
            return res
                .status(400)
                .json({success: false, message: generateValidationErrorMessage(error.details)});
        }
        const {nom, description, prix, actif = true, lignes} = value;

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const created = await AppDataSource.transaction(async (manager) => {
            const franchiseRepo = manager.getRepository(Franchise);
            const productRepo = manager.getRepository(Produit);
            const menuRepo = manager.getRepository(Menu);
            const lineRepo = manager.getRepository(MenuLigne);

            const franchise = await franchiseRepo.findOne({where: {id: franchiseId}});
            if (!franchise) throw new Error("FRANCHISE_NOT_FOUND");

            const productIds = lignes.map((l: any) => l.produitId);
            const products = await productRepo.findBy({id: In(productIds)});
            if (products.length !== productIds.length) throw new Error("PRODUIT_NOT_FOUND");

            const newMenu = await menuRepo.save(
                menuRepo.create({
                    nom,
                    description: description ?? null,
                    prix,
                    actif,
                    franchise: {id: franchiseId} as any,
                })
            );

            for (const l of lignes) {
                await lineRepo.save(
                    lineRepo.create({
                        menu: {id: newMenu.id} as any,
                        produit: {id: l.produitId} as any,
                        quantite: Number(l.quantite),
                    })
                );
            }

            return newMenu;
        });

        return res.status(201).json({success: true, data: created});
    } catch (e: any) {
        const msg = e?.message;
        if (msg === "FRANCHISE_NOT_FOUND") {
            return res.status(404).json({success: false, message: msg});
        }
        if (msg === "PRODUIT_NOT_FOUND") {
            return res.status(404).json({success: false, message: msg});
        }
        console.error("createMenu error:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function getMenu(req: Request, res: Response) {
    try {
        const {error, value} = GetMenuValidation.validate(req.params);
        if (error) {
            return res
                .status(400)
                .json({success: false, message: generateValidationErrorMessage(error.details)});
        }
        const {id} = value;

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const menuRepo = AppDataSource.getRepository(Menu);
        const menu = await menuRepo.findOne({
            where: {id, franchise: {id: franchiseId}} as any,
            relations: ["lignes", "lignes.produit"],
        });
        if (!menu) {
            return res.status(404).json({success: false, message: "MENU_NOT_FOUND"});
        }

        return res.status(200).json({success: true, data: menu});
    } catch (e) {
        console.error("getMenu error:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export async function updateMenu(req: Request, res: Response) {
    try {
        const {error, value} = UpdateMenuValidation.validate({
            id: req.params?.id,
            ...req.body,
        });

        if (error) {
            return res
                .status(400)
                .json({success: false, message: generateValidationErrorMessage(error.details)});
        }

        const {id, nom, description, prix, actif, lignes} = value;

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const updated = await AppDataSource.transaction(async (manager) => {
            const menuRepo = manager.getRepository(Menu);
            const lineRepo = manager.getRepository(MenuLigne);
            const productRepo = manager.getRepository(Produit);

            const menu = await menuRepo.findOne({
                where: {id, franchise: {id: franchiseId}} as any,
            });
            if (!menu) throw new Error("MENU_NOT_FOUND");

            if (nom !== undefined) menu.nom = nom;
            if (description !== undefined) menu.description = description;
            if (prix !== undefined) menu.prix = prix;
            if (typeof actif === "boolean") menu.actif = actif;

            await menuRepo.save(menu);

            if (Array.isArray(lignes)) {
                const productIds = lignes.map((l: any) => l.produitId);
                const products = await productRepo.findBy({id: In(productIds)});
                if (products.length !== productIds.length) throw new Error("PRODUIT_NOT_FOUND");

                await lineRepo.delete({menu: {id: menu.id} as any});

                const nouvelles = lignes.map((l: any) =>
                    lineRepo.create({
                        menu: {id: menu.id} as any,
                        produit: {id: l.produitId} as any,
                        quantite: Number(l.quantite),
                    })
                );
                await lineRepo.save(nouvelles);
            }

            const reloaded = await menuRepo.findOne({
                where: {id: menu.id, franchise: {id: franchiseId}} as any,
                relations: ["lignes", "lignes.produit"],
            });

            return reloaded;
        });

        return res.status(200).json({success: true, data: updated});
    } catch (e: any) {
        const msg = e?.message;
        if (msg === "MENU_NOT_FOUND") {
            return res.status(404).json({success: false, message: msg});
        }
        if (msg === "PRODUIT_NOT_FOUND") {
            return res.status(404).json({success: false, message: msg});
        }
        console.error("updateMenu error:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}