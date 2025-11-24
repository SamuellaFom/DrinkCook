import { Router } from "express";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import {listStocks} from "../../handles/frontOffice/stockFranchise-handle";
import { TypeRole } from "../../services/enums";

export const routerStocks = Router();

routerStocks.get("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), listStocks);
