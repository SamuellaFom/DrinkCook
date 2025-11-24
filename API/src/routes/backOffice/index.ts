import { Router } from "express";
import { routerFranchise } from "./franchise";
import { routerUser } from "./user";
import { routerCamion } from "./camion";
import { routerRole } from "./role";
import { routerEntrepot } from "./entrepot";
import { routerProduit } from "./produit";
import { routerCategory } from "./category";
import { routerClient } from "../frontOffice/client";
import { routerEntretien } from "./entretien";
import { routerPanne } from "./panne";
import { routerStock } from "./stock";
import { routerCommandetock } from "./commandeStocks";

export const routerBackoffice = Router();

routerBackoffice.use(`/franchises`, routerFranchise);
routerBackoffice.use(`/users`, routerUser);
routerBackoffice.use(`/roles`, routerRole);
routerBackoffice.use(`/camions`, routerCamion);
routerBackoffice.use(`/entrepots`, routerEntrepot);
routerBackoffice.use(`/produits`, routerProduit);
routerBackoffice.use(`/categories`, routerCategory);
routerBackoffice.use(`/clients`, routerClient);
routerBackoffice.use(`/entretiens`, routerEntretien)
routerBackoffice.use(`/pannes`, routerPanne);
routerBackoffice.use(`/stocks`, routerStock);
routerBackoffice.use(`/commandes-stocks`, routerCommandetock)