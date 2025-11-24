import Joi from "joi";

export const GetCamionIdValidation = Joi.object({
    id: Joi.number().integer().required(),
});

export const CreatePanneValidation = Joi.object({
    date_panne: Joi.string().isoDate().required(),
    description: Joi.string().min(3).max(1000).required(),
});
