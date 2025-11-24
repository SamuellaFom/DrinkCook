import Joi from "joi";
import {PaginationRequest} from "../../../services/validators";


export interface CreateCarteFideliteRequest {
    clientId: string;
    franchiseId: string;
    points?: number;
}

export interface UpdateCarteFideliteRequest {
    id: string;
    points: number;
}

export interface GetCarteFideliteRequest {
    id: string;
}

export interface ListCartesFideliteRequest {
    page?: number;
    limit?: number;
    clientId?: string;
    franchiseId?: string;
}


export const CreateCarteFideliteValidation = Joi.object<CreateCarteFideliteRequest>({
    clientId: Joi.string().required(),
    franchiseId: Joi.string().required(),
    points: Joi.number().integer().min(0).default(0),
}).options({ abortEarly: false, convert: true });


export const UpdateCarteFideliteValidation = Joi.object<UpdateCarteFideliteRequest>({
    id: Joi.string().required(),
    points: Joi.number().integer().min(0).required(),
}).options({ abortEarly: false, convert: true });

export const GetCarteFideliteValidation = Joi.object<GetCarteFideliteRequest>({
    id: Joi.string().required(),
}).options({ abortEarly: false });

export const ListCartesFideliteValidation = Joi.object<ListCartesFideliteRequest & PaginationRequest>({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    clientId: Joi.string().optional(),
    franchiseId: Joi.string().optional(),
}).options({ abortEarly: false, convert: true });