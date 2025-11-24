import { Router } from "express";

import {authenticateJWT, authorize} from "../../middlewares/authenticateJWT";
import {filterProduits} from "../../handles/frontOffice/produitFranchise-handle";
import { TypeRole } from "../../services/enums";

export const routerProduitFranchise = Router();

routerProduitFranchise.get("/search", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), filterProduits);



