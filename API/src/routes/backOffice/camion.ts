import { Router } from "express";
import { addCamion, getCamion, updateCamion, getAllCamion, getCamionInfo, assignCamionToEmplacement, getEmplacementInfo } from "../../handles/backOffice/camion-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerCamion = Router();

routerCamion.get('/list', authenticateJWT, authorize([TypeRole.ADMIN]), getCamionInfo);
routerCamion.get('/emplacements/', authenticateJWT, authorize([TypeRole.ADMIN]), getEmplacementInfo);
routerCamion.get('/', authenticateJWT, authorize([TypeRole.ADMIN]), getAllCamion);
routerCamion.get('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), getCamion);
routerCamion.post('/', authenticateJWT, authorize([TypeRole.ADMIN]), addCamion);
routerCamion.post('/', authenticateJWT, authorize([TypeRole.ADMIN]), addCamion);
routerCamion.post('/emplacements/assign', authenticateJWT, authorize([TypeRole.ADMIN]), assignCamionToEmplacement);
routerCamion.patch('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), updateCamion);