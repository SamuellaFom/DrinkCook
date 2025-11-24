import Joi from "joi";

export const CreatePanneValidation = Joi.object({
  camion: Joi.string().required(),
  date_panne: Joi.date().required(),
  description: Joi.string().required(),
  statut: Joi.string().optional(),
}).options({ abortEarly: false });

export const UpdatePanneValidation = Joi.object({
  id: Joi.number().required(),
  camion: Joi.number().optional(),
  statut: Joi.string().optional(),
  date_panne: Joi.date().optional(),
  description: Joi.string().optional(),
}).options({ abortEarly: false });