/****   espace franchisé *********/
import Joi from "joi";


export const FilterProduitValidation = Joi.object({
    q: Joi.string().allow("").optional(),
    categoryId: Joi.number().integer().optional(),
}).options({ abortEarly: false, convert: true });
