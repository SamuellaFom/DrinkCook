import Joi from "joi";
import { StatutCommandeClient } from "../../../services/enums";

export const CreateCommandeClientValidation = Joi.object({
    clientId: Joi.string().allow("", null),
    lignes: Joi.array().items(Joi.object({
        produitId: Joi.string().uuid().required(),
        quantite: Joi.number().integer().min(1).required(),
    })).default([]),
    menus: Joi.array().items(Joi.object({
        menuId: Joi.string().uuid().required(),
        quantite: Joi.number().integer().min(1).required(),
    })).default([]),
    utiliserPointsFidelite: Joi.boolean().optional(),
}).options({ abortEarly: false, convert: true });

export const GetCommandeClientValidation = Joi.object({
    id: Joi.string().uuid().required(),
}).options({ abortEarly: false, convert: true });

export const TransitionValidation = Joi.object({
    id: Joi.string().uuid().required(),
}).options({ abortEarly: false, convert: true });

export const ListCommandeClientsValidation = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    statut: Joi.string()
        .valid(
            StatutCommandeClient.EN_ATTENTE,
            StatutCommandeClient.PAYEE,
            StatutCommandeClient.LIVREE,
            StatutCommandeClient.ANNULEE
        )
        .optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
}).options({ abortEarly: false, convert: true });
