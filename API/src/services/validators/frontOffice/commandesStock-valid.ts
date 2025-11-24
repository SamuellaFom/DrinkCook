import Joi from "joi";
import { StatutCommande } from "../../../services/enums";

export const CreateCommandeStockFranchiseeValidation = Joi.object({
    entrepotId: Joi.number().integer().optional().allow(null),


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
});


export const ListCommandeStocksFranchiseeValidation = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    statut: Joi.string().valid(...Object.values(StatutCommande)),
    from: Joi.date().iso(),
    to: Joi.date().iso(),
});



export const UpdateCommandeStockFranchiseeValidation = Joi.object({
    id: Joi.number().integer().required(),
    entrepotId: Joi.number().integer().optional().allow(null),
    lignes: Joi.array().items(
        Joi.object({
            produitId: Joi.string().uuid().required(),
            quantite: Joi.number().integer().min(1).required(),
        })
    ).min(1),
});


export const ListStocksFranchiseeValidation = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    produitId: Joi.string().trim().optional(),
    categoryId: Joi.number().integer().optional(),
});
