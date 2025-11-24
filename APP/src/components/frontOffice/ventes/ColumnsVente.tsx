import { MRT_ColumnDef } from "material-react-table";
import {Vente} from "../../../assets/ts/FranchiseInterface";


export function columnsVente(): MRT_ColumnDef<Vente>[] {
    return [
        {
            accessorKey: "dateVente",
            header: "Date",
            size: 220,
            muiTableBodyCellProps: { className: "text-gray-800 whitespace-nowrap" },
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold" },
            Cell: ({ row }) => (
                <span className="font-medium">
          {new Date(row.original.dateVente).toLocaleString("fr-FR")}
        </span>
            ),
        },
        {
            accessorKey: "montant",
            header: "Montant",
            size: 120,
            muiTableBodyCellProps: { className: "text-gray-800 whitespace-nowrap" },
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold" },
            Cell: ({ row }) => <span className="font-semibold">{Number(row.original.montant).toFixed(2)} €</span>,
        },


        {
            accessorKey: "remiseFidelite",
            header: "Remise fidélité",
            size: 140,
            muiTableBodyCellProps: { className: "text-gray-800 whitespace-nowrap" },
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold" },
            Cell: ({ row }) => (
                <span className="text-gray-600">
      −{Number(row.original.remiseFidelite ?? 0).toFixed(2)} €
    </span>
            ),
        },



        {
            accessorKey: "id_formatted",
            header: "N°",
            size: 140,
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold" },
            muiTableBodyCellProps: { className: "whitespace-nowrap font-semibold text-gray-800" },
        },
    ];
}
