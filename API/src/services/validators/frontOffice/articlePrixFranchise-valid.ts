import Joi from "joi";

export const listArticlePrixFranchiseValidation = Joi.object({
    q: Joi.string().allow("", null),
    categoryId: Joi.number().integer().min(1).optional(),
    inStockOnly: Joi.boolean().optional(),
    actifsOnly: Joi.boolean().optional(),
});

export const upsertArticlePrixFranchise = Joi.object({
    produitId: Joi.string().required(),
    actif: Joi.boolean().optional(),
    prix_vente: Joi.number().min(0).precision(2).allow(null).optional(),
});
