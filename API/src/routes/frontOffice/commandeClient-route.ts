import { Router } from "express";
import {authenticateJWT, authorize} from "../../middlewares/authenticateJWT";
import {
    annulerCommandeClient,
    createCommandeClient,
    getCommandeClient,
    listCommandeClients, payerCommandeClient
} from "../../handles/frontOffice/commandeClient-handle";
import { TypeRole } from "../../services/enums";


export const routerCommandeClient = Router();


routerCommandeClient.get("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), listCommandeClients);
routerCommandeClient.post("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), createCommandeClient);
routerCommandeClient.get("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), getCommandeClient);
routerCommandeClient.post("/:id/payer", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), payerCommandeClient);
routerCommandeClient.post("/:id/annuler", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), annulerCommandeClient);
