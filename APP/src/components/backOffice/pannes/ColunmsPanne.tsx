import { MRT_ColumnDef } from "material-react-table";
import { Panne } from "../../../assets/ts/interfaces";

export function columnsPanne(): MRT_ColumnDef<Panne>[] {
  return [
    {
      accessorKey: "camion.immatriculation",
      header: "Immatriculation",
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
      accessorKey: "date_panne",
      header: "Date panne",
      size: 200,
      Cell: ({ cell }) => {
        const date = cell.getValue() as string;
        return (
          <span>
            {new Date(date).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        );
      },
      muiTableBodyCellProps: {
        className:
          "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
      },
    },
    {
      accessorKey: "created_at",
      header: "Créé le",
      size: 200,
      Cell: ({ cell }) => {
        const date = cell.getValue() as string;
        return (
          <span>
            {new Date(date).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      },
      muiTableBodyCellProps: {
        className:
          "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      size: 280,
      muiTableBodyCellProps: {
        className:
          "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
      },
      Cell: ({ cell }) => {
        const statut = cell.getValue<"déclarée" | "en_cours" | "reparée">();

        const colors: Record<typeof statut, string> = {
          déclarée:
            "bg-green-100 text-green-800 ring-1 ring-green-300 hover:bg-green-200 transition duration-300",
          en_cours:
            "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300 hover:bg-yellow-200 transition duration-300",
          reparée:
            "bg-blue-100 text-blue-800 ring-1 ring-blue-300 hover:bg-blue-200 transition duration-300",
        };

        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold select-none cursor-default ${colors[statut]}`}
            style={{ minWidth: 100, userSelect: "none" }}
            title={statut.replace("_", " ").toUpperCase()}
          >
            {statut.replace("_", " ").toUpperCase()}
          </span>
        );
      },
    },
  ];
}