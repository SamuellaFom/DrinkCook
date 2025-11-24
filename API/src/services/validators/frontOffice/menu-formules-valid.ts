import Joi from "joi";

export const CreateMenuValidation = Joi.object({
    nom: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow("", null),
    prix: Joi.number().precision(2).min(0).required(),
    actif: Joi.boolean().optional(),
    lignes: Joi.array()
        .items(
            Joi.object({
                produitId: Joi.string().required(),
                quantite: Joi.number().integer().min(1).required(),
            })
        )
        .min(1)
        .required(),
});

export const UpdateMenuValidation = Joi.object({
    id: Joi.string().required(),
    nom: Joi.string().min(2).max(200),
    description: Joi.string().allow("", null),
    prix: Joi.number().precision(2).min(0),
    actif: Joi.boolean(),
    lignes: Joi.array().items(
        Joi.object({
            produitId: Joi.string().required(),
            quantite: Joi.number().integer().min(1).required(),
        })
    ).min(1),
});

export const ListMenusValidation = Joi.object({
    q: Joi.string().allow("", null),
    actifsOnly: Joi.boolean().optional(),
});

export const GetMenuValidation = Joi.object({
    id: Joi.string().required(),
});
