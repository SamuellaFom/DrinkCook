import { useNavigate } from "react-router-dom";

type Section = {
  title: string;
  description: string;
  color: string;
  path: string;
};

const sections: Section[] = [
  {
    title: "Gestion des franchises",
    description:
      "Liste, création, modification et suppression des franchises. Accédez aux détails et au statut.",
    color: "bg-[#e8f0fe]",
    path: "/franchises",
  },
  {
    title: "Gestion des utilisateurs",
    description:
      "Liste des utilisateurs avec rôles. Création, modification, suppression et affectation à une franchise.",
    color: "bg-[#e6f4ea]",
    path: "/users",
  },
  {
    title: "Gestion du parc de camions",
    description:
      "Suivi des camions (état, entretiens, pannes, kilométrage). Ajout et modification.",
    color: "bg-[#fff7e6]",
    path: "/camions",
  },
  {
    title: "Gestion des entrepôts",
    description:
      "Liste, ajout, modification et suppression d’entrepôts. Détails : adresse, ville, produits stockés.",
    color: "bg-[#f1f8f5]",
    path: "/entrepots",
  },
  {
    title: "Gestion des produits",
    description:
      "Catalogue des produits avec filtres, ajout, modification et suppression.",
    color: "bg-[#fdecea]",
    path: "/produits",
  },
  {
    title: "Gestion des stocks par franchise",
    description:
      "Suivi des stocks par franchise, mise à jour des quantités et alertes faible stock.",
    color: "bg-[#fdf3e7]",
    path: "/stocks",
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Tableau de bord Administrateur</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => (
          <div
            key={index}
            onClick={() => navigate(section.path)}
            className={`${section.color} p-6 rounded-xl shadow-md cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg`}
          >
            <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow font-bold text-lg text-gray-700 select-none">
              {section.title.charAt(0)}
            </div>
            <h5 className="font-semibold text-lg mb-2">{section.title}</h5>
            <p className="text-sm text-gray-600">{section.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}