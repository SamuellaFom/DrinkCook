import { Router } from 'express';
import {authenticateJWT, authorize} from "../../middlewares/authenticateJWT";
import {
    createClient, deleteClient,
    getClient,
    getClientDetails,
    listClients,
    updateClient
} from "../../handles/frontOffice/client-handle";
import { TypeRole } from '../../services/enums';


export const routerClient = Router();

routerClient.post("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), createClient );
routerClient.get("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), listClients);
routerClient.get("/:id",authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), getClient);
routerClient.patch("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), updateClient);
routerClient.get("/:id/details", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), getClientDetails);
routerClient.delete("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), deleteClient);



