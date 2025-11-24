import Joi from "joi";

export const CreateProduitValidation = Joi.object({
  nom: Joi.string().required(),
  category: Joi.number().required(),
  description: Joi.string().required(),
  prix: Joi.number().required(),
  actif: Joi.boolean().required(),
}).options({ abortEarly: false });

export const GetProduitValidation = Joi.object({
  id: Joi.string().required()
}).options({ abortEarly: false });

export const UpdateProduitValidation = Joi.object({
  id: Joi.string().required(),
  nom: Joi.string().optional(),
  category: Joi.number().optional(),
  description: Joi.string().optional(),
  prix: Joi.number().optional(),
  actif: Joi.boolean().optional(),
}).options({ abortEarly: false });