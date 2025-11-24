import { Router } from "express";
import { getRolesInfo } from "../../handles/backOffice/role-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerRole = Router();

routerRole.get('/list', authenticateJWT, authorize([TypeRole.ADMIN]), getRolesInfo);