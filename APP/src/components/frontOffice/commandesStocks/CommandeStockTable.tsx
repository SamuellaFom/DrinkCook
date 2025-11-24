import {
    MaterialReactTable,
    useMaterialReactTable,
} from "material-react-table";
import {useMemo} from "react";
import {CommandeStock, StatutCommandeStock} from "../../../assets/ts/FranchiseInterface";
import {columnCommandesStock} from "./ColumnCommandeStock";

type Props = {
    data: CommandeStock[];
    onView?: (c: CommandeStock) => void;
    onEdit?: (c: CommandeStock) => void;
    onSubmit?: (c: CommandeStock) => void;
    onReceive?: (c: CommandeStock) => void;
    onDelete?: (c: CommandeStock) => void;
};

export default function CommandeStockTable({
                                               data,
                                               onView,
                                               onEdit,
                                               onSubmit,
                                               onReceive,
                                               onDelete,
                                           }: Props) {
    const columns = useMemo(() => columnCommandesStock(), []);

    const table = useMaterialReactTable({
        columns,
        data,
        initialState: {density: "compact"},
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

        renderRowActions: ({row}) => {
            const st = row.original.statut as StatutCommandeStock;

            const canEdit = !!onEdit && st === StatutCommandeStock.EN_COURS;
            const canSubmit = !!onSubmit && st === StatutCommandeStock.EN_COURS;
            const canReceive = !!onReceive && st === StatutCommandeStock.VALIDE;
            const canDelete = !!onDelete && st === StatutCommandeStock.EN_COURS;

            return (
                <div className="flex gap-2 items-center">
                    {}
                    {onView && (
                        <button
                            onClick={() => onView(row.original)}
                            className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                            type="button"
                        >
                            Voir
                        </button>
                    )}

                    {}
                    {canEdit && (
                        <button
                            onClick={() => onEdit!(row.original)}
                            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                            type="button"
                        >
                            Modifier
                        </button>
                    )}

                    {}
                    {canSubmit && (
                        <button
                            onClick={() => onSubmit!(row.original)}
                            className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
                            type="button"
                        >
                            Soumettre
                        </button>
                    )}

                    {}
                    {canReceive && (
                        <button
                            onClick={() => onReceive!(row.original)}
                            className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                            type="button"
                        >
                            Réceptionner
                        </button>
                    )}

                    {}
                    {canDelete && (
                        <button
                            onClick={() => onDelete!(row.original)}
                            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            type="button"
                        >
                            Supprimer
                        </button>
                    )}
                </div>
            );
        },
    });

    return <MaterialReactTable table={table}/>;
}
