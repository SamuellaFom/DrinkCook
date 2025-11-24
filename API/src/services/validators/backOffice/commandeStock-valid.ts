import Joi from "joi";

export const UpdateCommandeStockStatusValidation = Joi.object({
  id: Joi.number().required(),
  statut: Joi.string().required()
})