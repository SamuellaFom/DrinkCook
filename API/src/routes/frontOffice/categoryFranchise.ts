import { Router } from "express";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { getAllFranchiseCategory } from "../../handles/frontOffice/categoryFranchise";
import { TypeRole } from "../../services/enums";

export const routerCategoryFranchise = Router();

routerCategoryFranchise.get("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), getAllFranchiseCategory);