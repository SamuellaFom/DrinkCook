import {Router} from "express";
import {authenticateJWT, authorize} from "../../middlewares/authenticateJWT";
import {
    listArticlesPrixFranchise,
    upsertArticlePrixFranchiseHandler
} from "../../handles/frontOffice/articlePrixFranchise_handle";
import { TypeRole } from "../../services/enums";

export const routerAPF = Router();

routerAPF.get("/", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), listArticlesPrixFranchise);

routerAPF.put("/:produitId", authenticateJWT, authorize([TypeRole.MANAGER, TypeRole.EMPLOYE]), upsertArticlePrixFranchiseHandler);
