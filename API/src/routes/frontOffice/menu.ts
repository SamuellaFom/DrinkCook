import { Router } from "express";
import {authenticateJWT, authorize} from "../../middlewares/authenticateJWT";
import {createMenu, getMenu, listMenus, updateMenu} from "../../handles/frontOffice/menu-formules-handle";
import { TypeRole } from "../../services/enums";


export const routerMenus = Router();

routerMenus.get("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), listMenus);

routerMenus.post("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), createMenu);

routerMenus.get("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), getMenu);

routerMenus.patch("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), updateMenu);
