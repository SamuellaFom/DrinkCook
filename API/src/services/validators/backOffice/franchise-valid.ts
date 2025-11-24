import Joi from "joi";

interface CreateFranchiseRequest {
  nom: string,
  adresse: string,
  siret: string,
  ville: string,
  code_postal: string,
  statut: string,
}

export const CreateFranchiseValidation = Joi.object<CreateFranchiseRequest>({
  nom: Joi.string().required(),
  adresse: Joi.string().required(),
  siret: Joi.string().required(),
  ville: Joi.string().required(),
  code_postal: Joi.string().required(),
  statut: Joi.string().required()
}).options({ abortEarly: false });

export const GetFranchiseValidation = Joi.object({
  id: Joi.string().required()
}).options({ abortEarly: false });

export const UpdateFranchiseValidation = Joi.object({
  id: Joi.string().required(),
  nom: Joi.string().optional(),
  adresse: Joi.string().optional(),
  siret: Joi.string().optional(),
  ville: Joi.string().optional(),
  code_postal: Joi.string().optional(),
  statut: Joi.string().optional()
}).options({ abortEarly: false });