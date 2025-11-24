import { Router } from "express";
import { addEntrepot, getAllEntrepot, getEntrepot, updateEntrepot } from "../../handles/backOffice/entrepot-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerEntrepot = Router();

routerEntrepot.get('/', authenticateJWT, authorize([TypeRole.ADMIN]), getAllEntrepot);
routerEntrepot.get('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), getEntrepot);
routerEntrepot.post('/', authenticateJWT, authorize([TypeRole.ADMIN]), addEntrepot);
routerEntrepot.patch('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), updateEntrepot);