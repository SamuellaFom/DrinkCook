import {Request, Response} from "express";
import {AppDataSource} from "../../services/db/database";
import {Vente} from "../../services/db/models/vente";
import {generateValidationErrorMessage} from "../../services/validators";
import {CreateCommandeStockFranchiseeValidation} from "../../services/validators/frontOffice/commandesStock-valid";
import {ListVentesValidation} from "../../services/validators/frontOffice/vente-valid";


export async function listVentes(req: Request, res: Response) {
    try {
        const {error, value} = ListVentesValidation.validate(req.query);
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

        const {from, to} = value;

        const qb = AppDataSource.getRepository(Vente)
            .createQueryBuilder("v")
            .leftJoin("v.franchise", "f")
            .select([
                "v.id",
                "v.id_formatted",
                "v.dateVente",
                "v.montant",
                "v.remiseFidelite",
            ])
            .where("f.id = :fid", {fid: franchiseId})
            .orderBy("v.dateVente", "DESC");

        if (from) qb.andWhere("v.dateVente >= :from", {from});
        if (to) qb.andWhere("v.dateVente < :to", {to});

        const rows = await qb.getMany();
        const total = rows.reduce((s, r) => s + Number(r.montant), 0);

        res.status(200).json({success: true, data: rows, meta: {total, count: rows.length}});
    } catch (e) {
        console.error(e);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}
