import { Router } from "express";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import {listVentes} from "../../handles/frontOffice/vente-handle";
import { TypeRole } from "../../services/enums";



export const routerVente = Router();
routerVente.get("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), listVentes);
