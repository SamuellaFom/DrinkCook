import {Request, Response} from "express";
import {AppDataSource} from "../../services/db/database";
import {Entrepot} from "../../services/db/models/entrepot";

export async function listEntrepotsLite(req: Request, res: Response): Promise<Response> {
    try {
        const repo = AppDataSource.getRepository(Entrepot);
        const rows = await repo
            .createQueryBuilder("e")
            .select(["e.id", "e.nom"])
            .orderBy("e.nom", "ASC")
            .getMany();

        return res.status(200).json({success: true, data: rows});
    } catch (err) {
        console.error("Erreur listEntrepotsLite:", err);
        return res.status(500).json({success: false, message: "Erreur serveur"});
    }
}