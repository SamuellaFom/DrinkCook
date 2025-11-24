import { Router } from "express";
import { addEntretion } from "../../handles/backOffice/entretien-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerEntretien = Router();

routerEntretien.post('/', authenticateJWT, authorize([TypeRole.ADMIN]), addEntretion)