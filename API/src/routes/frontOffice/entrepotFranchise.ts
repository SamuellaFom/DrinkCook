import { Router } from "express";
import {authenticateJWT, authorize} from "../../middlewares/authenticateJWT";
import {listEntrepotsLite} from "../../handles/frontOffice/entrepotFranchise-handle";
import { TypeRole } from "../../services/enums";

export const routerEntrepotFranchise = Router();

routerEntrepotFranchise.get(`/`, authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), listEntrepotsLite);
