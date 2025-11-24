import { Router } from "express";
import { logout, login, refreshToken } from "../handles/auth";
import { authenticateJWT } from "../middlewares/authenticateJWT";

export const routerAuth = Router();

routerAuth.post("/signin", login);
routerAuth.get("/logout", authenticateJWT, logout);
routerAuth.post("/refresh-token", refreshToken);