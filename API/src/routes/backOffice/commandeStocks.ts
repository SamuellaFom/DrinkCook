import { Router } from "express";
import { getCommandStock, getCommandStockByStatus, updateStatut } from "../../handles/backOffice/commande-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerCommandetock = Router();

routerCommandetock.get('/',authenticateJWT, authorize([TypeRole.ADMIN]), getCommandStock);
routerCommandetock.get('/status', authenticateJWT, authorize([TypeRole.ADMIN]), getCommandStockByStatus);
routerCommandetock.put('/status/:id', authenticateJWT, authorize([TypeRole.ADMIN]), updateStatut);