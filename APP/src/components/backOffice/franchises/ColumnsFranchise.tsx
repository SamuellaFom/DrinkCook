import { MRT_ColumnDef } from "material-react-table";
import { Franchise } from "../../../assets/ts/interfaces";

export function columnsFranchise(): MRT_ColumnDef<Franchise>[] {
  return [
    {
      accessorKey: "nom",
      header: "Nom",
      size: 220,
      muiTableBodyCellProps: {
        sx: {
          fontWeight: "600",
          color: "#1F2937",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 280,
        },
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold",
      },
    },
    {
      accessorKey: "siret",
      header: "SIRET",
      size: 160,
      muiTableBodyCellProps: {
        sx: {
          fontFamily: "'Courier New', monospace",
        },
      },
      muiTableHeadCellProps: {
        className:
          "bg-indigo-50 text-indigo-900 text-center uppercase font-semibold",
      },
    },
    {
      accessorKey: "adresse",
      header: "Adresse",
      size: 280,
      muiTableBodyCellProps: {
        className:
          "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
      },
    },
    {
      accessorKey: "ville",
      header: "Ville",
      size: 140,
      muiTableBodyCellProps: {
        className: "text-gray-700 font-medium text-center",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase font-semibold text-center",
      },
    },
    {
      accessorKey: "code_postal",
      header: "Code Postal",
      size: 120,
      muiTableBodyCellProps: {
        className: "text-gray-600 font-semibold text-center tracking-wider",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase font-semibold text-center",
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      size: 140,
      muiTableBodyCellProps: {
        className: "text-center",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase font-semibold text-center",
      },
      Cell: ({ cell }) => {
        const statut = cell.getValue<"active" | "inactive" | "en_attente">();
        const colors = {
          active:
            "bg-green-100 text-green-800 ring-1 ring-green-300 hover:bg-green-200 transition duration-300",
          inactive:
            "bg-gray-100 text-gray-600 ring-1 ring-gray-300 hover:bg-gray-200 transition duration-300",
          en_attente:
            "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300 hover:bg-yellow-200 transition duration-300",
        };
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold select-none cursor-default ${
              colors[statut] ?? "bg-gray-100 text-gray-700"
            }`}
            style={{ minWidth: 70, userSelect: "none" }}
            title={statut.replace("_", " ").toUpperCase()}
          >
            {statut.replace("_", " ").toUpperCase()}
          </span>
        );
      },
    },
  ];
}