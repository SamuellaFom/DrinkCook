import {MRT_ColumnDef} from "material-react-table";
import {Evenement} from "../../../assets/ts/FranchiseInterface";


export function columnsEvenement(): MRT_ColumnDef<Evenement>[] {
    return [
        {
            accessorKey: "titre",
            header: "Titre",
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
            accessorKey: "dateDebut",
            header: "Début",
            size: 280,
            muiTableBodyCellProps: {
                className:
                    "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]",
            },
            muiTableHeadCellProps: {
                className:
                    "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
            },
            Cell: ({row}) => {
                return (
                    <span className="font-medium">
                        {new Date(row.original.dateDebut).toLocaleDateString(
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


        {
            accessorKey: "dateFin",
            header: "Fin",
            size: 280,
            muiTableBodyCellProps: {
                className:
                    "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]",
            },
            muiTableHeadCellProps: {
                className:
                    "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
            },
            Cell: ({row}) => {
                return row.original.dateFin ? (
                    <span className="font-medium">
                {new Date(row.original.dateFin).toLocaleDateString(
                    "fr-FR",
                    {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    }
                )}
            </span>
                ) : (
                    <span className="text-gray-400">—</span>
                );
            },
        },

    ];
}
