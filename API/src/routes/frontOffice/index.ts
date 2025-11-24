import {Router} from "express";
import {routerCommandeStock} from "../../routes/frontOffice/commandeStock";
import {routerProduitFranchise} from "../../routes/frontOffice/produitFranchise";
import {routerEntrepotFranchise} from "../../routes/frontOffice/entrepotFranchise";
import {routerCategoryFranchise} from "../../routes/frontOffice/categoryFranchise";
import {routerStocks} from "../../routes/frontOffice/stock";
import {routerClient} from "../../routes/frontOffice/client";
import {routerAPF} from "../../routes/frontOffice/articlePrixFranchise";
import {routerMenus} from "../../routes/frontOffice/menu";
import {authenticateJWT} from "../../middlewares/authenticateJWT";
import {routerCommandeClient} from "../../routes/frontOffice/commandeClient-route";
import {routerCamionFranchise} from "../../routes/frontOffice/camionFranchise";
import {listVentes} from "../../handles/frontOffice/vente-handle";
import {routerVente} from "../../routes/frontOffice/vente";
import {routerEvenement} from "../../routes/frontOffice/evenement";


export const routerFrontoffice = Router();

routerFrontoffice.use(`/commandes-stocks`, routerCommandeStock);
routerFrontoffice.use(`/search-produits`, routerProduitFranchise);
routerFrontoffice.use(`/entrepots`, routerEntrepotFranchise);
routerFrontoffice.use(`/categories`, routerCategoryFranchise);
routerFrontoffice.use(`/stocks`, routerStocks);
routerFrontoffice.use(`/clients`, routerClient);
routerFrontoffice.use('/article-prix', routerAPF);
routerFrontoffice.use('/menus', routerMenus);
routerFrontoffice.use('/commandes-clients', routerCommandeClient);
routerFrontoffice.use(`/camions`, routerCamionFranchise);
routerFrontoffice.use(`/ventes`, routerVente);
routerFrontoffice.use(`/evenements`, routerEvenement);



