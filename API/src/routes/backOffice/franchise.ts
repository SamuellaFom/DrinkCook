import { Router } from "express";
import { addFranchise, getFranchise, updateFranchise, getAllFranchise, getFranchiseInfo, getFranchisePdf, getAllFranchisePdf } from "../../handles/backOffice/franchise-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerFranchise = Router();

routerFranchise.get('/list', authenticateJWT, authorize([TypeRole.ADMIN]),  getFranchiseInfo)
routerFranchise.get('/reports/', authenticateJWT, authorize([TypeRole.ADMIN]), getAllFranchisePdf);
routerFranchise.get('/', authenticateJWT, authorize([TypeRole.ADMIN]), getAllFranchise);
routerFranchise.get('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), getFranchise);
routerFranchise.get('/reports/:id', authenticateJWT, authorize([TypeRole.ADMIN]), getFranchisePdf);
routerFranchise.post('/', authenticateJWT, authorize([TypeRole.ADMIN]),  addFranchise);
routerFranchise.patch('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), updateFranchise);