import {
    MaterialReactTable,
    useMaterialReactTable,
} from "material-react-table";
import {useMemo} from "react";

import {columnsEvenement} from "./ColumnsEvenement";
import {Evenement} from "../../../assets/ts/FranchiseInterface";


type Props = {
    data: Evenement[];
    onView?: (Evenement: Evenement) => void;
    onEdit: (Evenement: Evenement) => void;
    onDelete: (Evenement: Evenement) => void;
};

export default function EvenementTable({data, onEdit, onDelete, onView}: Props) {
    const columns = useMemo(() => columnsEvenement(), []);

    const table = useMaterialReactTable({
        columns,
        data,
        initialState: {
            density: "compact",
        },
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableGlobalFilter: true,
        globalFilterFn: "includesString",
        paginationDisplayMode: "pages",
        enableRowActions: true,
        muiPaginationProps: {
            color: "primary",
            shape: "rounded",
            variant: "outlined",
        },
        renderEmptyRowsFallback: () => (
            <div style={{padding: "1rem", textAlign: "center"}}>
                Aucune donnée disponible
            </div>
        ),
        renderRowActions: ({row}: { row: { original: Evenement } }) => (
            <div className="flex gap-2 items-center">
                {onView && (
                    <button
                        onClick={() => onView(row.original)}
                        aria-label={`Voir l'evenement ${row.original.titre}`}
                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    </button>
                )}

                <button
                    onClick={() => onEdit(row.original)}
                    aria-label={`Modifier l'événement ${row.original.titre}`}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    type="button"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5h2m-1 1v12m-5-6h10"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                        />
                    </svg>
                </button>

                <button
                    onClick={() => onDelete(row.original)}
                    aria-label={`Supprimer l'événement ${row.original.titre}`}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                    type="button"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                        />
                    </svg>
                </button>
            </div>
        ),
    });
    return <MaterialReactTable table={table}/>;
}









