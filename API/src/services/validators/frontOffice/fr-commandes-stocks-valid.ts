import Joi from "joi";
import { StatutCommande } from "../../../services/enums";

export const CreateCommandeStockFranchiseeValidation = Joi.object({
    franchiseId: Joi.string().uuid().required(),  
    entrepotId: Joi.number().integer().required(),
    lignes: Joi.array()
        .items(
            Joi.object({
                produitId: Joi.string().uuid().required(),
                quantite: Joi.number().integer().min(1).required(),
            })
        )
        .min(1)
        .required(),
});

export const GetCommandeStockFranchiseeValidation = Joi.object({
    id: Joi.number().integer().required(),
    franchiseId: Joi.string().uuid().required(),
});

export const ListCommandeStocksFranchiseeValidation = Joi.object({
    franchiseId: Joi.string().uuid().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    statut: Joi.string().valid(...Object.values(StatutCommande)),
    from: Joi.date().iso(),
    to: Joi.date().iso(),
});

export const TransitionStockFranchiseeValidation = Joi.object({
    id: Joi.number().integer().required(),
    franchiseId: Joi.string().uuid().required(),
});



export const UpdateCommandeStockFranchiseeValidation = Joi.object({
    id: Joi.number().integer().required(),
    franchiseId: Joi.string().uuid().required(),
    entrepotId: Joi.number().integer(), // optionnel
    lignes: Joi.array().items(
        Joi.object({
            produitId: Joi.string().uuid().required(),
            quantite: Joi.number().integer().min(1).required(),
        })
    ).min(1), // optionnel mais si présent, min 1
});
