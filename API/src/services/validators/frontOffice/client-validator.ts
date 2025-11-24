import Joi from "joi";


const telSchema = Joi.string()
    .pattern(/^[0-9+\s().-]{6,20}$/)
    .allow("", null);


export const CreateClientValidation = Joi.object({
    nom: Joi.string().min(1).max(150).required(),
    email: Joi.string().email().max(150).required(),
    telephone: telSchema.optional(),
}).options({abortEarly: false, convert: true })


export const GetClientValidation = Joi.object({
    id: Joi.string().required(),

}).options({ abortEarly: false });


export const UpdateClientValidation = Joi.object({
    id: Joi.string().required(),
    nom: Joi.string().min(1).max(150).optional(),
    email: Joi.string().email().max(150).optional(),
    telephone: telSchema.optional(),

}).options({ abortEarly: false, convert: true });

export const ListClientsValidation = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(10),
    q: Joi.string().trim().optional(),
    nom: Joi.string().trim().optional(),
    email: Joi.string().trim().optional(),
}).options({ abortEarly: false, convert: true });


