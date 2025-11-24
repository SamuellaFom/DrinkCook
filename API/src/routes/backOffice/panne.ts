import { Router } from "express";
import { addPanne, UpdatePanne, getPannes, getPanne } from "../../handles/backOffice/panne-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerPanne = Router();

routerPanne.post('/', authenticateJWT, authorize([TypeRole.ADMIN]), addPanne);
routerPanne.get('/', authenticateJWT, authorize([TypeRole.ADMIN]), getPannes);
routerPanne.get('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), getPanne);
routerPanne.patch('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), UpdatePanne)