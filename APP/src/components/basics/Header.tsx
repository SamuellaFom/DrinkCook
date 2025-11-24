import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { logout as apiLogout } from "../../api/auth";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { role, logout: logoutContext} = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiLogout();
      logoutContext();
      navigate("/login");
    } catch (e) {
      console.error("Erreur logout", e);
    }
  };

  const sections = [
    { title: "Franchises", path: "/franchises" },
    { title: "Utilisateurs", path: "/users" },
    {
      title: "Camions",
      path: "/camions",
      options: [
        { title: "Liste véhicules", path: "/camions" },
        { title: "Liste pannes", path: "/camions/pannes" },
      ],
    },
    { title: "Entrepôts", path: "/entrepots" },
    { title: "Produits", path: "/produits" },
    {
      title: "Stocks",
      path: "/stocks",
      options: [
        { title: "Commandes à valider", path: "/stocks/commandes" },
        { title: "Stocks par franchise", path: "/stocks/franchises" },
      ],
    },
    { title: "Rapport", path: "/rapport" },
  ];

  const franchiseSections = [
    {
      title: "Stocks & Approvisionnements",
      options: [
        {
          title: "Approvisionnements",
          path: "/home-franchise/commandes-stocks",
        },
        { title: "Inventaire", path: "/home-franchise/stocks" },
      ],
    },
    {
      title: "Clients & Commandes",
      options: [
        { title: "Clients", path: "/home-franchise/clients" },
        { title: "Commandes clients", path: "/home-franchise/commandes" },
      ],
    },
    {
      title: "Menus & Produits",
      options: [
        { title: "Prix produits", path: "/home-franchise/menu/articles" },
        { title: "Menus/Formules", path: "/home-franchise/menu/menus" },
      ],
    },
    { title: "Mon camion", path: "/home-franchise/camion" },
    {
      title: "Activité",
      options: [
        { title: "Ventes", path: "/home-franchise/ventes" },
        { title: "Événements", path: "/home-franchise/evenements" },
      ],
    },
  ];

  const navSections =
    role === "Administrateur"
      ? sections
      : role === "Manager" || role === "Employe"
      ? franchiseSections
      : [];

  const homePath = role === "Administrateur" ? "/" : "/home-franchise";

  return (
    <header className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to={homePath}
          className="text-2xl font-extrabold text-blue-700 tracking-wide"
        >
          <span className="text-gray-900">DRIV'N </span>COOK
        </Link>

        <nav className="hidden md:flex space-x-6 font-medium text-gray-700">
          {navSections.map(({ title, path, options }) =>
            options ? (
              <div key={title} className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === title ? null : title)
                  }
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  {title}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === title ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdown === title && (
                  <div className="absolute left-0 mt-2 bg-white shadow-lg rounded-md">
                    {options.map((opt) => (
                      <Link
                        key={opt.title}
                        to={opt.path}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 whitespace-nowrap"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {opt.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={title}
                to={path}
                className="hover:text-blue-600 transition-colors duration-200"
              >
                {title}
              </Link>
            )
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center px-3 py-2 rounded-md gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
            />
          </svg>
        </button>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-white shadow-md">
          <div className="flex flex-col px-6 py-4 space-y-3 font-medium text-gray-700">
            {navSections.map(({ title, path, options }) =>
              options ? (
                <div key={title}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{title}</span>
                  </div>
                  <div className="ml-4 flex flex-col space-y-2 mt-1">
                    {options.map((opt) => (
                      <Link
                        key={opt.title}
                        to={opt.path}
                        className="block hover:text-blue-600"
                        onClick={() => setMenuOpen(false)}
                      >
                        {opt.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={title}
                  to={path}
                  className="block hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  {title}
                </Link>
              )
            )}

            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-3 py-2 rounded-m gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                />
              </svg>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
