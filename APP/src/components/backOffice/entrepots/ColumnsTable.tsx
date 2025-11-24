import { MRT_ColumnDef } from "material-react-table";
import { Entrepot } from "../../../assets/ts/interfaces";

export function columnsEntrepot(): MRT_ColumnDef<Entrepot>[] {
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
      accessorKey: "code_postal",
      header: "Code postal",
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