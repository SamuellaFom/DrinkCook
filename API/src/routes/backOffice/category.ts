import { Router } from "express";
import { getAllCategory } from "../../handles/backOffice/category-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerCategory = Router();

routerCategory.get('/', authenticateJWT, authorize([TypeRole.ADMIN]), getAllCategory)