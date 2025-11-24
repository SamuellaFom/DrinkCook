import { Router } from "express";
import { addProduit, getAllAProduit, getProduit, updateProduit } from "../../handles/backOffice/produit-handle";
import { authenticateJWT, authorize } from "../../middlewares/authenticateJWT";
import { TypeRole } from "../../services/enums";

export const routerProduit = Router();

routerProduit.get('/', authenticateJWT, authorize([TypeRole.ADMIN]), getAllAProduit);
routerProduit.get('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), getProduit)
routerProduit.post('/', authenticateJWT, authorize([TypeRole.ADMIN]), addProduit);
routerProduit.patch('/:id', authenticateJWT, authorize([TypeRole.ADMIN]), updateProduit);