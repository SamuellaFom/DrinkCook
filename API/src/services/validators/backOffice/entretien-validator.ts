import Joi from "joi";

export const CreateEntretienValidation = Joi.object({
  camion: Joi.number().required(),
  date_revision: Joi.date().optional(),
  description: Joi.string().required(),
  kilometrage: Joi.number().optional(),
  realisé_par: Joi.string().required()
})