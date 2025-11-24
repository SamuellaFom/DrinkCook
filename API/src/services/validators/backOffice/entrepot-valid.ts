import Joi from "joi";

export const CreateEntrepotValidation = Joi.object({
  nom: Joi.string().required(),
  adresse: Joi.string().required(),
  ville: Joi.string().required(),
  code_postal: Joi.number().min(1000).max(99000).required(),
}).options({ abortEarly: false });

export const GetEntrepotValidation = Joi.object({
  id: Joi.number().required()
}).options({ abortEarly: false });

export const UpdateEntrepotValidation = Joi.object({
  id: Joi.number().required(),
  nom: Joi.string().optional(),
  adresse: Joi.string().optional(),
  ville: Joi.string().optional(),
  code_postal: Joi.string().optional(),
}).options({ abortEarly: false });