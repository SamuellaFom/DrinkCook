import Joi from "joi";

export const ListVentesValidation = Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso(),
});
