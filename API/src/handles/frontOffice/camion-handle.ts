import {Request, Response} from "express";
import {AppDataSource} from "../../services/db/database";
import {generateValidationErrorMessage} from "../../services/validators";

import {Camion} from "../../services/db/models/camion";
import {Panne} from "../../services/db/models/panne";
import {PanneStatut} from "../../services/enums";

import {
    CreatePanneValidation,
    GetCamionIdValidation,
} from "../../services/validators/frontOffice/camion-valid";

export async function getMonCamion(req: Request, res: Response) {
    try {
        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const camion = await AppDataSource.getRepository(Camion).findOne({
            where: {franchise: {id: franchiseId}},
            select: {
                id: true, immatriculation: true, date_achat: true, kilometrage: true, statut: true,
            },
        });

        if (!camion) {
            return res.status(404).json({success: false, message: "NO_TRUCK_FOR_FRANCHISE"});
        }
        return res.status(200).json({success: true, data: camion});
    } catch (e) {
        console.error(e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}


export async function declarePanne(req: Request, res: Response) {
    try {
        const idValidation = GetCamionIdValidation.validate(req.params);
        if (idValidation.error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(idValidation.error.details),
            });
        }
        const camionId = idValidation.value.id as number;

        const {error, value} = CreatePanneValidation.validate(req.body);
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

        const camion = await AppDataSource.getRepository(Camion)
            .createQueryBuilder("camion")
            .select(["camion.id"])
            .where("camion.id = :id", {id: camionId})
            .andWhere("camion.franchiseId = :fid", {fid: franchiseId})
            .getOne();

        if (!camion) {
            return res.status(404).json({success: false, message: "TRUCK_NOT_FOUND"});
        }

        const panne = await AppDataSource.getRepository(Panne).save({
            camion: {id: camion.id},
            date_panne: new Date(value.date_panne),
            description: value.description,
            statut: PanneStatut.DECLARE,
        });

        return res.status(201).json({success: true, data: panne});
    } catch (e) {
        console.error(e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

