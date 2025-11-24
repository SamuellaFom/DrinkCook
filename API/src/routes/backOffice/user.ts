import { Router } from "express";
import { addUser, getUser, updateUser, getAllUser, updateUserPassword } from "../../handles/backOffice/user-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerUser = Router();

routerUser.get("/:id", authenticateJWT, authorize([TypeRole.ADMIN]), getUser);
routerUser.get("/", authenticateJWT, authorize([TypeRole.ADMIN]), getAllUser);
routerUser.patch("/:id", authenticateJWT, authorize([TypeRole.ADMIN]), updateUser);
routerUser.put("/password", updateUserPassword);
routerUser.post("/", authenticateJWT, authorize([TypeRole.ADMIN]), addUser);