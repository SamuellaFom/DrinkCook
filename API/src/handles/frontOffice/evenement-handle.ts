import {Request, Response} from "express";
import {AppDataSource} from "../../services/db/database";
import {Evenement} from "../../services/db/models/evenement";
import {Franchise} from "../../services/db/models/franchise";
import {Not, IsNull} from "typeorm";


import {generateValidationErrorMessage} from "../../services/validators";
import {
    CreateEvenementValidation,
    GetEvenementValidation, ListEvenementsValidation,
    UpdateEvenementValidation
} from "../../services/validators/frontOffice/evenement-valid";
import {sendMail} from "../../services/services/EvenementEmail/mailer";
import {CarteFidelite} from "../../services/db/models/carteFidelite";


export async function createEvenement(req: Request, res: Response) {
    try {
        const {error, value} = CreateEvenementValidation.validate(req.body);
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

        const {titre, description, dateDebut, dateFin, notifyClients} = value;

        const repoFranchise = AppDataSource.getRepository(Franchise);
        const franchise = await repoFranchise.findOne({where: {id: franchiseId}});
        if (!franchise) {
            return res.status(404).json({success: false, message: "FRANCHISE_NOT_FOUND"});
        }

        const repoEvenement = AppDataSource.getRepository(Evenement);
        const evenement = await repoEvenement.save(
            repoEvenement.create({
                titre,
                description: description ?? null,
                dateDebut,
                dateFin: dateFin ?? null,
                franchise,
            })
        );

        if (notifyClients === true) {
            try {
                const cartes = await AppDataSource.getRepository(CarteFidelite).find({
                    where: {franchise: {id: franchiseId} as any},
                    relations: ["client"],
                });

                const emails = Array.from(
                    new Set(
                        (cartes || [])
                            .map(c => c.client?.email)
                            .filter((e): e is string => !!e && e.includes("@"))
                    )
                );

                console.log("notifyClients:", notifyClients);
                console.log("emails trouvés:", emails.length, emails);

                if (emails.length > 0) {
                    const subject = `[${franchise.nom}] Nouvel évènement : ${titre}`;
                    const html = `
        <h2>${titre}</h2>
        <p><b>Date :</b> ${new Date(dateDebut).toLocaleString()}
           ${dateFin ? " → " + new Date(dateFin).toLocaleString() : ""}</p>
        ${description ? `<p>${description}</p>` : ""}

        <hr />
        <p><b>Franchise :</b> ${franchise.nom}</p>
        <p><b>Adresse :</b> ${franchise.adresse}, ${franchise.code_postal} ${franchise.ville}</p>
    `;

                    await sendMail({subject, html, bcc: emails.join(",")});
                }

            } catch (mailErr) {
                console.error("Erreur lors de l'envoi des mails :", mailErr);
            }
        }

        return res.status(201).json({success: true, data: evenement});
    } catch (e) {
        console.error("Erreur createEvenement:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}


export async function getEvenement(req: Request, res: Response) {
    try {
        const {error, value} = GetEvenementValidation.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }
        const {id} = value;

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(401).json({success: false, message: "UNAUTHORIZED"});
        }

        const repo = AppDataSource.getRepository(Evenement);
        const ev = await repo.findOne({
            where: {id, franchise: {id: franchiseId}},
            select: ["id", "titre", "description", "dateDebut", "dateFin"],
            relations: ["franchise"],
        });

        if (!ev) {
            return res.status(404).json({success: false, message: "EVENEMENT_NOT_FOUND"});
        }

        return res.status(200).json({success: true, data: ev});
    } catch (e) {
        console.error(e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}


export async function listEvenements(req: Request, res: Response) {
    try {
        const {error, value} = ListEvenementsValidation.validate(req.query);
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

        const {from, to, page, limit} = value as {
            from?: string;
            to?: string;
            page: number;
            limit: number;
        };

        const skip = (page - 1) * limit;

        const qb = AppDataSource.getRepository(Evenement)
            .createQueryBuilder("e")
            .leftJoin("e.franchise", "f")
            .select(["e.id", "e.titre", "e.description", "e.dateDebut", "e.dateFin"])
            .where("f.id = :fid", {fid: franchiseId});

        if (from) qb.andWhere("e.dateDebut >= :from", {from});
        if (to) qb.andWhere("e.dateDebut < :to", {to});

        qb.orderBy("e.dateDebut", "ASC").skip(skip).take(limit);

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
        console.error(e);
        return res
            .status(500)
            .json({success: false, message: "Internal server error"});
    }
}

export async function deleteEvenement(req: Request, res: Response) {
    try {
        const {error, value} = GetEvenementValidation.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }

        const {id, franchiseId} = value;

        const repo = AppDataSource.getRepository(Evenement);
        const ev = await repo.findOne({
            where: {id, franchise: {id: franchiseId}},
            relations: ["franchise"],
        });
        if (!ev) {
            res.status(404).json({success: false, message: "EVENEMENT_NOT_FOUND"});
            return;
        }

        await repo.remove(ev);
        res.status(200).json({success: true, data: true});
    } catch (e) {
        console.error(e);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}


export async function updateEvenement(req: Request, res: Response): Promise<Response> {
    try {
        const {error, value} = UpdateEvenementValidation.validate({...req.params, ...req.body});
        if (error) {
            return res.status(400).json({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }

        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(403).json({success: false, message: "NO_FRANCHISE_SCOPE"});
        }

        const repo = AppDataSource.getRepository(Evenement);

        const ev = await repo.findOne({
            where: {id: value.id, franchise: {id: franchiseId}},
            relations: ["franchise"],
        });

        if (!ev) {
            return res.status(404).json({success: false, message: "EVENEMENT_NOT_FOUND"});
        }

        if (value.titre !== undefined) ev.titre = value.titre;
        if (value.description !== undefined) ev.description = value.description ?? null;
        if (value.dateDebut !== undefined) ev.dateDebut = value.dateDebut;
        if (value.dateFin !== undefined) ev.dateFin = value.dateFin ?? null;

        const updated = await repo.save(ev);

        return res.status(200).json({success: true, data: updated});
    } catch (e) {
        console.error("Erreur updateEvenement:", e);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}
