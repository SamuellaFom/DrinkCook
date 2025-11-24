import React, { useMemo, useEffect, useState } from "react";
import {
  useMaterialReactTable,
  MaterialReactTable,
} from "material-react-table";
import { columnsCommandeStock } from "../../../components/backOffice/stocks/ColumnsStocks";
import { CommandeStock } from "../../../assets/ts/interfaces";
import { commandeStockService } from "../../../api/backOffice/commandeStockService";

export default function CommandeStockTable() {
  const [data, setData] = useState<CommandeStock[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [processedRows, setProcessedRows] = useState<Set<number>>(new Set());

  const columns = useMemo(() => columnsCommandeStock(), []);

  const handleUpdateStatus = async (rowId: number, newStatus: string) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, statut: newStatus } : row
      )
    );

    setProcessedRows((prev) => new Set(prev).add(rowId));

    try {
      await commandeStockService.updateByStatus(rowId, newStatus);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut :", err);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    manualPagination: true,
    rowCount,
    state: { pagination, isLoading },
    onPaginationChange: setPagination,
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
      <div className="p-4 text-center text-gray-500">
        Aucune donnée disponible
      </div>
    ),
    renderRowActions: ({ row }) => {
      const isProcessed = processedRows.has(row.original.id);

      return isProcessed ? null : (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleUpdateStatus(row.original.id, "valide")}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Valider
          </button>
          <button
            onClick={() => handleUpdateStatus(row.original.id, "annulee")}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Rejeter
          </button>
        </div>
      );
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      });
      const res = await commandeStockService.getAllByStatus(params);
      setData(res.data);
      setRowCount(res.total);
    } catch (err) {
      console.error("Erreur lors du fetch des commandes :", err);
      setData([]);
      setRowCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination]);

  return (
    <div className="p-4">
      <MaterialReactTable table={table} />
    </div>
  );
}