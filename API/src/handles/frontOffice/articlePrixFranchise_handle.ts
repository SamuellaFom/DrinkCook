import {Request, Response} from "express";
import {AppDataSource} from "../../services/db/database";
import {generateValidationErrorMessage} from "../../services/validators";
import {Produit} from "../../services/db/models/produit";
import {
    listArticlePrixFranchiseValidation,
    upsertArticlePrixFranchise
} from "../../services/validators/frontOffice/articlePrixFranchise-valid";
import {ArticlePrixFranchise} from "../../services/db/models/articlePrixFranchise";
import {QueryFailedError} from "typeorm";

export async function listArticlesPrixFranchise(req: Request, res: Response) {
    try {
        const {error, value} = listArticlePrixFranchiseValidation.validate(req.query);
        if (error) {
            return res
                .status(400)
                .json({success: false, message: generateValidationErrorMessage(error.details)});
        }

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const {q, categoryId, inStockOnly, actifsOnly} = value;

        const qb = AppDataSource.getRepository(Produit)
            .createQueryBuilder("produit")
            .leftJoin("produit.category", "categorie")
            .leftJoin("produit.stocks", "stock")
            .leftJoin("stock.franchise", "fr", "fr.id = :fid", {fid: franchiseId})
            .leftJoin(
                ArticlePrixFranchise,
                "apf",
                "apf.produit_id = produit.id AND apf.franchise_id = :fid",
                {fid: franchiseId}
            )
            .select([
                "produit.id AS p_id",
                "produit.nom AS p_nom",
                "produit.description AS p_desc",
                "produit.prix AS p_prix",
                "categorie.id AS c_id",
                "categorie.nom AS c_nom",
            ])
            .addSelect("COALESCE(stock.quantite, 0)", "stock_dispo")
            .addSelect("COALESCE(apf.actif, false)", "apf_actif")
            .addSelect("apf.prix_vente", "apf_prix_vente")
            .where("produit.actif = TRUE");

        if (categoryId) {
            qb.andWhere("categorie.id = :categoryId", {categoryId});
        }
        if (q && String(q).trim() !== "") {
            const like = `%${String(q).trim()}%`;
            qb.andWhere(
                "(produit.nom ILIKE :like OR produit.description ILIKE :like OR categorie.nom ILIKE :like)",
                {like}
            );
        }
        if (inStockOnly) {
            qb.andWhere("COALESCE(stock.quantite, 0) > 0");
        }
        if (actifsOnly) {
            qb.andWhere("COALESCE(apf.actif, false) = TRUE");
        }

        const bruts = await qb.getRawMany();

        const data = bruts.map((r: any) => {
            const basePrice = Number(r.p_prix);
            const salePrice = r.apf_prix_vente != null ? Number(r.apf_prix_vente) : null;
            return {
                id: r.p_id,
                nom: r.p_nom,
                description: r.p_desc ?? "",
                prix: salePrice ?? basePrice,
                basePrice,
                actif: r.apf_actif === true,
                category: r.c_id ? {id: r.c_id, nom: r.c_nom} : null,
                stockDispo: Number(r.stock_dispo ?? 0),
            };
        });

        return res.status(200).json({success: true, data});
    } catch (e) {
        console.error("listArticlesPrixFranchise error:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}


export async function upsertArticlePrixFranchiseHandler(req: Request, res: Response) {
    try {
        const {error, value} = upsertArticlePrixFranchise.validate({
            produitId: req.params?.produitId,
            ...req.body,
        });
        if (error) {
            return res
                .status(400)
                .json({success: false, message: generateValidationErrorMessage(error.details)});
        }

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const {produitId, actif, prix_vente} = value;

        const repoProduit = AppDataSource.getRepository(Produit);
        const produit = await repoProduit.findOne({where: {id: produitId}});
        if (!produit) {
            return res.status(404).json({success: false, message: "PRODUIT_NOT_FOUND"});
        }

        const repoAPF = AppDataSource.getRepository(ArticlePrixFranchise);
        let ligne = await repoAPF.findOne({
            where: {franchise: {id: franchiseId}, produit: {id: produitId}} as any,
        });

        if (!ligne) {
            ligne = repoAPF.create({
                franchise: {id: franchiseId} as any,
                produit: {id: produitId} as any,
                actif: typeof actif === "boolean" ? actif : true,
                prix_vente: prix_vente === null || typeof prix_vente === "number" ? prix_vente : null,
            });
        } else {
            if (typeof actif === "boolean") ligne.actif = actif;
            if (prix_vente === null) ligne.prix_vente = null;
            if (typeof prix_vente === "number") ligne.prix_vente = prix_vente;
        }

        const saved = await repoAPF.save(ligne);
        return res.status(200).json({success: true, data: saved});
    } catch (e: any) {
        if (e instanceof QueryFailedError && (e as any).driverError?.code === "23505") {
            return res.status(409).json({success: false, message: "Duplicate or constraint error"});
        }
        console.error("upsertArticlePrixFranchiseHandler error:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}