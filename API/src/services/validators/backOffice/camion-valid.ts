import Joi from "joi";

export const CreateCamionValidation = Joi.object({
  franchise: Joi.string().required(),
  immatriculation: Joi.string().required(),
  date_achat: Joi.date().required(),
  kilometrage: Joi.number().required(),
  statut: Joi.string().optional(),
}).options({ abortEarly: false });

export const GetCamionValidation = Joi.object({
  id: Joi.number().required()
}).options({ abortEarly: false });

export const UpdateCamionValidation = Joi.object({
  id: Joi.number().required(),
  franchise: Joi.string().optional(),
  immatriculation: Joi.string().optional(),
  date_achat: Joi.date().optional(),
  kilometrage: Joi.number().optional(),
  statut: Joi.string().optional(),
}).options({ abortEarly: false });