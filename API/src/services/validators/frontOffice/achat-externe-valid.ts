import Joi from "joi";

export const CreateAchatExterneValidation = Joi.object({
    franchiseId: Joi.string().uuid().required(),
    dateAchat: Joi.date().iso().optional(),
    fournisseur: Joi.string().allow("", null),
    montantTotal: Joi.number().positive().required(),
});

export const ListAchatsExternesValidation = Joi.object({
    franchiseId: Joi.string().uuid().required(),
    from: Joi.date().iso(),
    to: Joi.date().iso(),
});
