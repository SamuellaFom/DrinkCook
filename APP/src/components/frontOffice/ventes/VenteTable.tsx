import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo } from "react";

import { columnsVente } from "./ColumnsVente";
import {Vente} from "../../../assets/ts/FranchiseInterface";

export default function VenteTable({ data }: { data: Vente[] }) {
    const columns = useMemo(() => columnsVente(), []);
    const table = useMaterialReactTable({
        columns,
        data,
        initialState: { density: "compact" },
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableGlobalFilter: true,
        globalFilterFn: "includesString",
        paginationDisplayMode: "pages",
        enableRowActions: false,
        muiPaginationProps: { color: "primary", shape: "rounded", variant: "outlined" },
        renderEmptyRowsFallback: () => <div style={{ padding: "1rem", textAlign: "center" }}>Aucune vente</div>,
    });
    return <MaterialReactTable table={table} />;
}
