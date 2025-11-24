import { MRT_ColumnDef } from "material-react-table";
import { Produit } from "../../../assets/ts/interfaces";

export function columnsProduit(): MRT_ColumnDef<Produit>[] {
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
      accessorKey: "prix",
      header: "Prix",
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
      accessorKey: "actif",
      header: "Actif",
      size: 150,
      muiTableBodyCellProps: {
        className:
          "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
      },
      Cell: ({ cell }) => {
        const actif = cell.getValue<boolean>();
        const colors = actif
          ? "bg-green-100 text-green-800 ring-1 ring-green-300"
          : "bg-red-100 text-red-800 ring-1 ring-red-300";

        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold select-none cursor-default ${colors}`}
            style={{ minWidth: 60, textAlign: "center" }}
          >
            {actif ? "Oui" : "Non"}
          </span>
        );
      },
    },
    {
      accessorKey: "category.nom",
      header: "Category",
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
  ];
}