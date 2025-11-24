import {Request, Response} from "express";
import {AppDataSource} from "../../services/db/database";
import {Stock} from "../../services/db/models/stock";
import {generateValidationErrorMessage} from "../../services/validators";
import {ListStocksFranchiseeValidation} from "../../services/validators/frontOffice/commandesStock-valid";

export async function listStocks(req: Request, res: Response) {
    try {
        const {error, value} = ListStocksFranchiseeValidation.validate(req.query);
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

        const {page, limit, produitId, categoryId} = value as {
            page: number;
            limit: number;
            produitId?: string;
            categoryId?: number;
        };
        const offset = (page - 1) * limit;

        const qb = AppDataSource.getRepository(Stock)
            .createQueryBuilder("s")
            .leftJoin("s.franchise", "f")
            .leftJoin("s.produit", "p")
            .leftJoin("p.category", "cat")
            .select([
                "s.id",
                "s.quantite",
                "p.id",
                "p.nom",
                "p.prix",
                "p.seuil",
                "cat.id",
                "cat.nom",
            ])
            .where("f.id = :fid", {fid: franchiseId});

        if (produitId) {
            qb.andWhere("p.id = :pid", {pid: produitId});
        }

        if (typeof categoryId === "number") {
            qb.andWhere("cat.id = :cid", {cid: categoryId});
        }

        qb.orderBy("p.nom", "ASC").skip(offset).take(limit);

        const [rows, total] = await qb.getManyAndCount();

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
        console.error("listStocks error:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}
