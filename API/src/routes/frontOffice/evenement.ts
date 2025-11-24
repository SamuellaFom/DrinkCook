import {Router} from "express";
import {authenticateJWT, authorize} from "../../middlewares/authenticateJWT";
import {
    createEvenement,
    deleteEvenement,
    getEvenement,
    listEvenements,
    updateEvenement
} from "../../handles/frontOffice/evenement-handle";
import { TypeRole } from "../../services/enums";


export const routerEvenement = Router();

routerEvenement.get("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), listEvenements);

routerEvenement.post("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), createEvenement);

routerEvenement.get("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), getEvenement);

routerEvenement.patch("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), updateEvenement);

routerEvenement.delete("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), deleteEvenement);
