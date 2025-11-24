import Joi from "joi";

export const CreateStockValidation = Joi.object({
  franchise: Joi.string().required(),
  produit: Joi.string().required(),
  quantite: Joi.number().required()
}).options({ abortEarly: false });

export const GetStockValidation = Joi.object({
  id: Joi.number().required()
}).options({ abortEarly: false });

export const UpdateStockValidation = Joi.object({
  id: Joi.number().required(),
  franchise: Joi.string().optional(),
  produit: Joi.string().optional(),
  quantite: Joi.number().optional()
}).options({ abortEarly: false });