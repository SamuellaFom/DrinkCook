import {Request, Response} from "express";
import {generateValidationErrorMessage} from "../../services/validators";
import {AppDataSource} from "../../services/db/database";
import {Produit} from "../../services/db/models/produit";
import {FilterProduitValidation} from "../../services/validators/frontOffice/produitFranchise-valid";

export async function filterProduits(req: Request, res: Response): Promise<Response> {
    try {
        const {error, value} = FilterProduitValidation.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }

        const franchiseId = res.locals?.user?.franchiseId;
        const {q, categoryId} = value as { q?: string; categoryId?: number };

        const repo = AppDataSource.getRepository(Produit);
        const qb = repo
            .createQueryBuilder("p")
            .leftJoin("p.category", "c")
            .leftJoin("p.stocks", "st")
            .leftJoin("st.franchise", "f", "f.id = :fid", {fid: franchiseId})
            .select([
                "p.id",
                "p.nom",
                "p.description",
                "p.prix",
                "p.actif",
                "c.id",
                "c.nom",
            ])
            .addSelect("COALESCE(st.quantite, 0)", "stockDispo")
            .andWhere("p.actif = TRUE");

        if (categoryId) qb.andWhere("c.id = :categoryId", {categoryId});
        if (q && q.trim() !== "") {
            const like = `%${q.trim()}%`;
            qb.andWhere("(p.nom ILIKE :like OR p.description ILIKE :like OR c.nom ILIKE :like)", {like});
        }

        const rows = await qb.getRawMany();

        const produits = rows.map((r: any) => ({
            id: r.p_id,
            nom: r.p_nom,
            description: r.p_description,
            prix: r.p_prix,
            actif: r.p_actif,
            category: r.c_id ? {id: r.c_id, nom: r.c_nom} : null,
            stockDispo: Number(r.stockDispo ?? 0),
        }));

        return res.status(200).json({success: true, data: produits});
    } catch (err) {
        console.error("Erreur filterProduits:", err);
        return res.status(500).json({success: false, message: "Erreur serveur"});
    }
}
