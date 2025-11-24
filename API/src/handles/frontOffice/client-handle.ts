import {Request, Response} from "express";
import {generateValidationErrorMessage} from "../../services/validators";
import {Client} from "../../services/db/models/client";
import {AppDataSource} from "../../services/db/database";
import {Franchise} from "../../services/db/models/franchise";
import {CarteFidelite} from "../../services/db/models/carteFidelite";
import {Not, QueryFailedError} from "typeorm";
import {CommandeClient} from "../../services/db/models/commandeClient";
import {Vente} from "../../services/db/models/vente";
import {CreateCommandeStockFranchiseeValidation} from "../../services/validators/frontOffice/commandesStock-valid";
import {
    CreateClientValidation, GetClientValidation,
    ListClientsValidation,
    UpdateClientValidation
} from "../../services/validators/frontOffice/client-validator";

export async function createClient(req: Request, res: Response) {
    try {
        const {error, value} = CreateClientValidation.validate(req.body);
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

        const clientRepository = AppDataSource.getRepository(Client);
        const exists = await clientRepository.findOne({
            where: {email: value.email},
        });
        if (exists) {
            return res
                .status(409)
                .send({success: false, message: "email already exists"});
        }

        const client = await clientRepository.save({
            nom: value.nom,
            email: value.email,
            telephone: value.telephone || null,
        });

        if (!client) {
            return res
                .status(500)
                .send({success: false, message: "Failed to create client"});
        }

        const franchiseRepository = AppDataSource.getRepository(Franchise);
        const carteRepository = AppDataSource.getRepository(CarteFidelite);

        const franchise = await franchiseRepository.findOne({
            where: {id: value.franchiseId},
        });
        if (!franchise) {
            return res.status(404).send({
                success: false,
                message: `franchise ${value.franchiseId} not found`,
            });
        }

        const carte = await carteRepository.save(
            carteRepository.create({
                client,
                franchise,
                points: 0,
            })
        );

        return res.status(201).send({success: true, data: client, carte});
    } catch (error) {
        if (error instanceof QueryFailedError && error.driverError?.code === "23505") {
            return res
                .status(409)
                .send({success: false, message: "Duplicate or constraint error"});
        }

        console.error(error);
        return res
            .status(500)
            .send({success: false, message: "Internal server error"});
    }
}

export async function getClient(req: Request, res: Response) {
    try {
        const {error, value} = GetClientValidation.validate(req.params);
        if (error) {
            return res.status(400).send({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }

        const clientRepository = AppDataSource.getRepository(Client);
        const client = await clientRepository
            .createQueryBuilder("client")
            .where("client.id = :id", {id: value.id})
            .getOne();

        if (!client) {
            return res
                .status(404)
                .send({success: false, message: `client ${value.id} not found`});
        }

        return res.status(200).json({success: true, data: client});
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({success: false, message: "Internal server error"});
    }
}

export async function updateClient(req: Request, res: Response) {
    try {
        const validation = UpdateClientValidation.validate({...req.params, ...req.body});
        if (validation.error) {
            res.status(400).send({success: false, message: generateValidationErrorMessage(validation.error.details)});
            return;
        }

        const updateRequest = validation.value;
        const clientRepository = AppDataSource.getRepository(Client);
        const client = await clientRepository.findOneBy({id: updateRequest.id});
        if (!client) {
            res.status(404).send({success: false, message: `client ${updateRequest.id} not found`});
            return;
        }

        if (updateRequest.email) {
            const other = await clientRepository.findOne({
                where: {
                    email: updateRequest.email,
                    id: Not(updateRequest.id)
                }
            });
            if (other) {
                res.status(409).send({success: false, message: "EMAIL_ALREADY_EXISTS"});
                return;
            }
            client.email = updateRequest.email;
        }

        if (updateRequest.nom) client.nom = updateRequest.nom;
        if (updateRequest.telephone !== undefined) client.telephone = updateRequest.telephone || null;

        await clientRepository.save(client);

        res.status(200).send({success: true, data: client});

    } catch (error) {
        if (error instanceof QueryFailedError && error.driverError?.code === "23505") {
            res.status(409).send({success: false, message: "Duplicate or constraint error"});
            return;
        }

        console.error(error);
        res.status(500).send({success: false, message: "Internal server error"});
    }
}

export async function listClients(req: Request, res: Response) {
    try {
        const franchiseId = res.locals?.user?.franchiseId;
        if (!franchiseId) {
            return res.status(403).json({success: false, message: "NO_FRANCHISE_SCOPE"});
        }

        const {error, value} = ListClientsValidation.validate(req.query);
        if (error) {
            return res.status(400).json({success: false, message: generateValidationErrorMessage(error.details)});
        }

        const {page, limit, nom, email, q} = value;
        const skip = (page - 1) * limit;

        const clientQuery = AppDataSource.getRepository(Client)
            .createQueryBuilder("client")
            .select([
                "client.id",
                "client.nom",
                "client.email",
                "client.telephone",
                "client.createdAt",
            ])
            .orderBy("client.createdAt", "DESC")
            .skip(skip)
            .take(limit);

        if (nom) clientQuery.andWhere("client.nom ILIKE :nom", {nom: `%${nom}%`});
        if (email) clientQuery.andWhere("client.email ILIKE :email", {email: `%${email}%`});
        if (q) clientQuery.andWhere("(client.nom ILIKE :q OR client.email ILIKE :q)", {q: `%${q}%`});

        clientQuery
            .leftJoin("client.cartesFidelite", "carte")
            .andWhere("carte.franchise.id = :franchiseId", {franchiseId});

        const [clients, total] = await clientQuery.getManyAndCount();

        return res.status(200).send({
            success: true,
            data: clients,
            pagination: {total, page, limit, totalPages: Math.ceil(total / limit)},
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({success: false, message: "Internal server error"});
    }
}

export async function getClientDetails(req: Request, res: Response) {
    try {
        const {error, value} = GetClientValidation.validate(req.params);
        if (error) {
            return res.status(400).send({success: false, message: generateValidationErrorMessage(error.details)});
        }

        const client = await AppDataSource.getRepository(Client)
            .createQueryBuilder("client")
            .select(["client.id", "client.nom", "client.email", "client.telephone", "client.createdAt"])
            .where("client.id = :id", {id: value.id})
            .getOne();

        if (!client) {
            return res.status(404).send({success: false, message: `client ${value.id} not found`});
        }

        const cartesQb = AppDataSource.getRepository(CarteFidelite)
            .createQueryBuilder("carte")
            .leftJoin("carte.client", "c")
            .leftJoinAndSelect("carte.franchise", "franchise")
            .select(["carte.id", "carte.points", "franchise.id", "franchise.nom"])
            .where("c.id = :id", {id: value.id});

        const commandesQb = AppDataSource.getRepository(CommandeClient)
            .createQueryBuilder("cmd")
            .leftJoin("cmd.client", "c")
            .leftJoinAndSelect("cmd.franchise", "franchise")
            .select([
                "cmd.id",
                "cmd.dateCommande",
                "cmd.statut",
                "cmd.montantTotal",
                "franchise.id",
                "franchise.nom",
            ])
            .where("c.id = :id", {id: value.id})
            .orderBy("cmd.dateCommande", "DESC")
            .limit(5);

        const ventesQb = AppDataSource.getRepository(Vente)
            .createQueryBuilder("vente")
            .leftJoin("vente.commandeClient", "cmd")
            .leftJoin("cmd.client", "c")
            .leftJoinAndSelect("vente.franchise", "franchise")
            .select([
                "vente.id",
                "vente.dateVente",
                "vente.montant",
                "vente.remiseFidelite",
                "franchise.id",
                "franchise.nom",
                "cmd.id",
            ])
            .where("c.id = :id", {id: value.id})
            .orderBy("vente.dateVente", "DESC")
            .limit(5);

        const [cartes, commandes, ventes] = await Promise.all([
            cartesQb.getMany(),
            commandesQb.getMany(),
            ventesQb.getMany(),
        ]);

        res.status(200).json({
            success: true,
            data: {
                ...client,
                cartesFidelite: cartes,
                commandes,
                ventes,
            },
        });
    } catch (error) {
        if (error instanceof Error) console.log(error.message);
        res.status(500).send({success: false, message: "Internal server error"});
    }
}


export async function deleteClient(req: Request, res: Response) {
    try {
        const {error, value} = GetClientValidation.validate(req.params);
        if (error) {
            return res.status(400).send({
                success: false,
                message: generateValidationErrorMessage(error.details),
            });
        }

        const clientRepository = AppDataSource.getRepository(Client);
        const client = await clientRepository.findOneBy({id: value.id});
        if (!client) {
            return res
                .status(404)
                .send({success: false, message: `client ${value.id} not found`});
        }

        await clientRepository.remove(client);

        return res.status(200).send({
            success: true,
            message: `client ${value.id} deleted successfully (linked ventes/commandes preserved)`,
        });
    } catch (error) {
        console.error(error);

        if (error instanceof QueryFailedError && error.driverError?.code === "23503") {
            return res.status(500).send({
                success: false,
                message: "Cannot delete client: foreign key constraint. Please check DB relation (should be SET NULL).",
            });
        }

        return res
            .status(500)
            .send({success: false, message: "Internal server error"});
    }
}
