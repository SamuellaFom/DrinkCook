import Joi from "joi";

export const CreateUserValidation = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().required(),
  role: Joi.string().required(),
  franchise: Joi.string().required(),
}).options({ abortEarly: false });

export const GetUserValidation = Joi.object({
  id: Joi.string().required()
}).options({ abortEarly: false });

export const UpdateUserValidation = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().optional(),
  email: Joi.string().optional(),
  role: Joi.string().optional(),
  franchise: Joi.string().optional(),
}).options({ abortEarly: false });

export const UpdatePasswordValidation = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  confirmpassword: Joi.string().required(),
}).options({ abortEarly: false });