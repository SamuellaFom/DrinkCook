import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo } from "react";
import {CommandeClient} from "../../../api/frontOffice/commandeClientService";
import {columnsCommandeClient} from "./ColumnsCommande";

type Props = {
    data: CommandeClient[];
    onView?: (commande: CommandeClient) => void;
    onPay?: (commande: CommandeClient) => void;
    onCancel?: (commande: CommandeClient) => void;
};

export default function CommandeClientTable({ data, onView, onPay, onCancel }: Props) {
    const columns = useMemo(() => columnsCommandeClient(), []);
    const table = useMaterialReactTable({
        columns,
        data,
        initialState: { density: "compact" },
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableGlobalFilter: true,
        globalFilterFn: "includesString",
        paginationDisplayMode: "pages",
        enableRowActions: true,
        muiPaginationProps: { color: "primary", shape: "rounded", variant: "outlined" },
        renderEmptyRowsFallback: () => (
            <div style={{ padding: "1rem", textAlign: "center" }}>Aucune donnée disponible</div>
        ),
        renderRowActions: ({ row }) => (
            <div className="flex gap-2 items-center">
                {onView && (
                    <button
                        onClick={() => onView(row.original)}
                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition"
                        type="button"
                    >
                        Voir
                    </button>
                )}
                {onPay && row.original.statut === "en_attente" && (
                    <button
                        onClick={() => onPay(row.original)}
                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                        type="button"
                    >
                        Payer
                    </button>
                )}
                {onCancel && row.original.statut === "en_attente" && (
                    <button
                        onClick={() => onCancel(row.original)}
                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                        type="button"
                    >
                        Annuler
                    </button>
                )}
            </div>
        ),
    });

    return <MaterialReactTable table={table} />;
}
