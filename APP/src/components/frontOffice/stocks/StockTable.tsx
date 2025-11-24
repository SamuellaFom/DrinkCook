import { useMemo } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from "material-react-table";
import { columnsStock } from "./ColumnsStock";
import {StockItem} from "../../../assets/ts/FranchiseInterface";

export default function StockTable({ data }: { data: StockItem[] }) {
    const columns = useMemo(() => columnsStock(10), []);
    const table = useMaterialReactTable({
        columns,
        data,
        initialState: { density: "compact" },
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableGlobalFilter: true,
        globalFilterFn: "includesString",
        paginationDisplayMode: "pages",
        muiPaginationProps: { color: "primary", shape: "rounded", variant: "outlined" },
        renderEmptyRowsFallback: () => (
            <div style={{ padding: "1rem", textAlign: "center" }}>Aucune donnée disponible</div>
        ),
    });

    return <MaterialReactTable table={table} />;
}
