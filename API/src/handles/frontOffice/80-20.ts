import {Request, Response} from "express";
import {AppDataSource} from "../../services/db/database";
import {CommandeStock} from "../../services/db/models/commandes_stock";
import {StatutCommande} from "../../services/enums";

export async function previewQuota8020(req: Request, res: Response) {
    try {
        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const maintenant = new Date();
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1, 0, 0, 0, 0);
        const debutMoisSuivant = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1, 0, 0, 0, 0);

        const repoCommande = AppDataSource.getRepository(CommandeStock);

        const directRow = await repoCommande
            .createQueryBuilder("c")
            .leftJoin("c.franchise", "f")
            .where("f.id = :fid", {fid: franchiseId})
            .andWhere("c.statut = :s", {s: StatutCommande.LIVREE})
            .andWhere("c.entrepot IS NULL")
            .andWhere("c.date_reception >= :from AND c.date_reception < :to", {
                from: debutMois,
                to: debutMoisSuivant,
            })
            .select("COALESCE(SUM(c.montant_total), 0)", "sum")
            .getRawOne<{ sum: string }>();

        const totalRow = await repoCommande
            .createQueryBuilder("c")
            .leftJoin("c.franchise", "f")
            .where("f.id = :fid", {fid: franchiseId})
            .andWhere("c.statut = :s", {s: StatutCommande.LIVREE})
            .andWhere("c.date_reception >= :from AND c.date_reception < :to", {
                from: debutMois,
                to: debutMoisSuivant,
            })
            .select("COALESCE(SUM(c.montant_total), 0)", "sum")
            .getRawOne<{ sum: string }>();

        const directLivre = Number(directRow?.sum ?? 0);
        const totalLivre = Number(totalRow?.sum ?? 0);

        const plafondDirect = totalLivre * 0.20;
        const resteDirectAutorise = Math.max(0, plafondDirect - directLivre);

        return res.status(200).json({
            success: true,
            data: {
                directLivre,
                totalLivre,
                resteDirectAutorise,
            },
        });
    } catch (e) {
        console.error("Erreur previewQuota8020:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}
