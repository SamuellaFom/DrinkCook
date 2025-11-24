import { MRT_ColumnDef } from "material-react-table";
import { CommandeStock } from "../../../assets/ts/interfaces";
import { useState } from "react";

export function columnsCommandeStock(): MRT_ColumnDef<CommandeStock>[] {
  return [
    {
      accessorKey: "statut",
      header: "Statut",
      size: 120,
      Cell: ({ cell, row }) => {
        const statut = cell.getValue() as string;

        const statutClasses =
          statut === "valide"
            ? "bg-emerald-100 text-emerald-700"
            : statut === "annulee"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700";

        if (statut === "en_cours") {
          return (
            <div className="flex gap-1 justify-center">
              <button className="px-2 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition">
                Valider
              </button>
              <button className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition">
                Rejeter
              </button>
            </div>
          );
        }

        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statutClasses}`}
          >
            {statut === "annulee"
              ? "Annule"
              : statut === "valide"
              ? "Valide"
              : statut}
          </span>
        );
      },
    },
    {
      accessorKey: "id_formatted",
      header: "#",
      size: 120,
      muiTableBodyCellProps: { sx: { fontWeight: "600", color: "#1F2937" } },
      muiTableHeadCellProps: {
        className: "bg-gray-50 text-gray-700 uppercase text-xs font-bold",
      },
    },
    {
      accessorKey: "date_commande",
      header: "Date",
      size: 200,
      Cell: ({ cell }) =>
        new Date(cell.getValue() as string).toLocaleString("fr-FR"),
      muiTableBodyCellProps: { className: "text-gray-800 whitespace-nowrap" },
      muiTableHeadCellProps: {
        className: "bg-gray-50 text-gray-700 uppercase font-semibold",
      },
    },
    {
      accessorKey: "franchise.nom",
      header: "Franchise",
      size: 180,
    },
    {
      accessorKey: "entrepot.nom",
      header: "Entrepôt",
      size: 180,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? String(value) : "E_EXTERNE";
      },
    },
    {
      accessorKey: "produits",
      header: "Produits",
      size: 250,
      Cell: ({ cell }) => {
        const produits = cell.getValue() as {
          produit: { nom: string, prix: string};
          quantite: number;
        }[];

        const [showAll, setShowAll] = useState(false);

        if (!produits || produits.length === 0) return "—";

        const displayList = showAll ? produits : produits.slice(0, 2);
        const remainingCount = produits.length - 2;

        return (
          <div>
            <ul className="space-y-1">
              {displayList.map((p, idx) => (
                <li key={idx} className="flex justify-between">
                  <span className="font-medium text-gray-800">
                    {p.produit.nom}
                  </span>
                  <span className="text-gray-600 font-semibold">
                    {p.produit.prix} x {p.quantite}
                  </span>
                </li>
              ))}
            </ul>

            {!showAll && remainingCount > 0 && (
              <div
                onClick={() => setShowAll(true)}
                className="mt-1 text-xs text-blue-500 cursor-pointer hover:underline"
              >
                +{remainingCount} produit{remainingCount > 1 ? "s" : ""}{" "}
                supplémentaires
              </div>
            )}

            {showAll && (
              <div
                onClick={() => setShowAll(false)}
                className="mt-1 text-xs text-gray-400 cursor-pointer hover:underline"
              >
                Réduire
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "montant_total",
      header: "Montant (€)",
      size: 120,
      Cell: ({ cell }) =>
        cell.getValue()
          ? Number(cell.getValue() as number).toFixed(2) + " €"
          : "—",
      muiTableBodyCellProps: { className: "text-right" },
    },
  ];
}