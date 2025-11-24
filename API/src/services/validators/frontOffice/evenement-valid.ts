import Joi from "joi";

export const CreateEvenementValidation = Joi.object({
    titre: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow("", null).default(""),
    dateDebut: Joi.date().iso().required(),
    dateFin: Joi.date().iso().allow(null),
    notifyClients: Joi.boolean().optional(),
}).custom((val, h) => {
    if (val.dateDebut && val.dateFin && new Date(val.dateFin) < new Date(val.dateDebut)) {
        return h.error("any.invalid", { message: "dateFin < dateDebut" });
    }
    return val;
})


export const UpdateEvenementValidation = Joi.object({
    id: Joi.string().uuid().required(),
    titre: Joi.string().min(2).max(200),
    description: Joi.string().allow("", null),
    dateDebut: Joi.date().iso(),
    dateFin: Joi.date().iso().allow(null),
}).custom((val, h) => {
    if (val.dateDebut && val.dateFin && new Date(val.dateFin) < new Date(val.dateDebut)) {
        return h.error("any.invalid", { message: "dateFin < dateDebut" });
    }
    return val;
})


export const GetEvenementValidation = Joi.object({
    id: Joi.string().uuid().required(),
});

export const ListEvenementsValidation = Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});
