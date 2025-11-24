import { MRT_ColumnDef } from "material-react-table";
import { Client } from "../../../assets/ts/FranchiseInterface";


export function columnsClient(): MRT_ColumnDef<Client>[] {
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
            accessorKey: "email",
            header: "Email",
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
            accessorKey: "telephone",
            header: "Téléphone",
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
                const value = cell.getValue<string | null>();
                return value ? (
                    <span className="text-gray-700">{value}</span>
                ) : (
                    <span className="text-gray-400 italic">Non renseigné</span>
                );
            },

        },






        {
            accessorKey: "createdAt",
            header: "Créé le",
            size: 280,
            muiTableBodyCellProps: {
                className:
                    "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]",
            },
            muiTableHeadCellProps: {
                className:
                    "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
            },
            Cell: ({ row }) => {
                return (
                    <span className="font-medium">
                        {new Date(row.original.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            }
                        )}
                        </span>
                );

            },

        },






    ];
}