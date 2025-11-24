import { Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import LoginPage from "../pages/login";
import FranchiseList from "../pages/backOffice/franchises/FranchiseList";
import UserlistPage from "../pages/backOffice/users/UserList";
import CamionListPage from "../pages/backOffice/camions/CamionList";
import EntrepotListPage from "../pages/backOffice/entrepots/EntrepotList";
import ProduitListPage from "../pages/backOffice/produits/ProduitList";
import PrivateRoute from "../components/basics/PrivateRoute";
import Header from "../components/basics/Header";
import AdminDashboard from "../pages/backOffice/home";
import ClientListPage from "../pages/frontOffice/clients/ClientList";
import EvenementList from "../pages/frontOffice/evenements/EvenementList";
import VenteListPage from "../pages/frontOffice/ventes/VenteListPage";
import MainStocks from "../pages/backOffice/stocks/stockPage";
import CommandeStockTable from "../pages/backOffice/stocks/StockTable";
import FranchiseDetail from "../pages/backOffice/franchises/FranchiseDetailPage";
import RapportsPage from "../pages/backOffice/rapport";
import PanneListPage from "../pages/backOffice/pannes/PanneList";
import CommandeStockListPage from "../pages/frontOffice/commandesStocks/CommandeStockListPage";
import StockListPage from "../pages/frontOffice/stock/StockListPage";
import ArticlePrixPage from "../pages/frontOffice/menu/ArticlePrixPage";
import MenusPage from "../pages/frontOffice/menu/MenusPage";
import CommandeClientListPage from "../pages/frontOffice/commandes/CommandeListPage";
import MonCamionPage from "../pages/frontOffice/camion/CamionPage";
import FranchiseDashboard from "../pages/frontOffice/FranchiseHome";
import Unauthorized from "../pages/unauthorized";

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isPublicRoute = ["/login", "/sign-up"].includes(location.pathname);

  return (
    <>
      {isAuthenticated && !isPublicRoute && <Header />}
      <Routes>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/franchises"
          element={
            <PrivateRoute
              element={<FranchiseList />}
              allowedRoles={["Administrateur"]}
            />
          }
        />
        <Route
          path="/franchises/:id"
          element={
            <PrivateRoute
              element={<FranchiseDetail />}
              allowedRoles={["Administrateur"]}
            />
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute
              element={<UserlistPage />}
              allowedRoles={["Administrateur"]}
            />
          }
        />
        <Route
          path="/camions"
          element={
            <PrivateRoute
              element={<CamionListPage />}
              allowedRoles={["Administrateur"]}
            />
          }
        />
        <Route
          path="/entrepots"
          element={
            <PrivateRoute
              element={<EntrepotListPage />}
              allowedRoles={["Administrateur"]}
            />
          }
        />
        <Route
          path="/produits"
          element={
            <PrivateRoute
              element={<ProduitListPage />}
              allowedRoles={["Administrateur"]}
            />
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute
              element={<AdminDashboard />}
              allowedRoles={["Administrateur"]}
            />
          }
        />

        <Route
          path="/stocks/franchises"
          element={
            <PrivateRoute
              element={<MainStocks />}
              allowedRoles={["Administrateur"]}
            />
          }
        />

        <Route
          path="/stocks/commandes"
          element={
            <PrivateRoute
              element={<CommandeStockTable />}
              allowedRoles={["Administrateur"]}
            />
          }
        />

        <Route
          path="/rapport"
          element={
            <PrivateRoute
              element={<RapportsPage />}
              allowedRoles={["Administrateur"]}
            />
          }
        />

        <Route
          path="/camions/pannes"
          element={
            <PrivateRoute
              element={<PanneListPage />}
              allowedRoles={["Administrateur"]}
            />
          }
        />

        {/**********route FRANCHISE  *************/}

        <Route
          path="/home-franchise"
          element={
            <PrivateRoute
              element={<FranchiseDashboard />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />

        <Route
          path="/home-franchise/commandes-stocks"
          element={
            <PrivateRoute
              element={<CommandeStockListPage />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />

        <Route
          path="/home-franchise/stocks"
          element={
            <PrivateRoute
              element={<StockListPage />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />

        <Route
          path="/home-franchise/clients"
          element={
            <PrivateRoute
              element={<ClientListPage />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />

        <Route
          path="/home-franchise/menu/articles"
          element={
            <PrivateRoute
              element={<ArticlePrixPage />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />

        <Route
          path="/home-franchise/menu/menus"
          element={
            <PrivateRoute
              element={<MenusPage />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />

        <Route
          path="/home-franchise/commandes"
          element={
            <PrivateRoute
              element={<CommandeClientListPage />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />

        <Route
          path="/home-franchise/camion"
          element={
            <PrivateRoute
              element={<MonCamionPage />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />

        <Route
          path="/home-franchise/ventes"
          element={
            <PrivateRoute
              element={<VenteListPage />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />

        <Route
          path="/home-franchise/evenements"
          element={
            <PrivateRoute
              element={<EvenementList />}
              allowedRoles={["Manager", "Employe"]}
            />
          }
        />
      </Routes>
    </>
  );
};
