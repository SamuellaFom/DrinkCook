import { Router } from "express";
import { getStocks } from "../../handles/backOffice/stock-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerStock = Router();

routerStock.get('/', authenticateJWT, authorize([TypeRole.ADMIN]), getStocks);