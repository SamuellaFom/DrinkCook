import {Router} from "express";
import {authenticateJWT, authorize} from "../../middlewares/authenticateJWT";
import {getMonCamion, declarePanne} from "../../handles/frontOffice/camion-handle";
import { TypeRole } from "../../services/enums";

export const routerCamionFranchise = Router();

routerCamionFranchise.get("/camion", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), getMonCamion);

routerCamionFranchise.post("/:id/pannes", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), declarePanne);
