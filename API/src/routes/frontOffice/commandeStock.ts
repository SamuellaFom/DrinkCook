import {authenticateJWT, authorize} from "../../middlewares/authenticateJWT";
import {
    createCommandeStock,
    getCommandeStock,
    listCommandeStocks, receptionnerCommandeStock, soumettreCommandeStock, supprimerCommandeStock,
    updateCommandeStock
} from "../../handles/frontOffice/commandeStock-handle";
import {Router} from "express";
import {previewQuota8020} from "../../handles/frontOffice/80-20";
import { TypeRole } from "../../services/enums";

export const routerCommandeStock = Router();

routerCommandeStock.get("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), listCommandeStocks);
routerCommandeStock.post("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), createCommandeStock);
routerCommandeStock.get("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), getCommandeStock);
routerCommandeStock.patch("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), updateCommandeStock);

routerCommandeStock.post("/:id/soumettre", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), soumettreCommandeStock);
routerCommandeStock.post("/:id/receptionner", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), receptionnerCommandeStock);
routerCommandeStock.delete("/:id", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), supprimerCommandeStock);
routerCommandeStock.get("/80-20/preview", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), previewQuota8020);
