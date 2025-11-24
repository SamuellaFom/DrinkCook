import { useCallback, useEffect, useState } from "react";
import { StockItem } from "../../../assets/ts/FranchiseInterface";
import {stockFranchiseService} from "../../../api/frontOffice/stockFranchiseService";
import CategoryPickerCard from "../../../components/frontOffice/stocks/CategoryPickerCard";
import StockTable from "../../../components/frontOffice/stocks/StockTable";

export default function StockListPage() {
    const [rows, setRows] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

    const fetchRows = useCallback(async () => {
        try {
            setLoading(true);
            const data = await stockFranchiseService.list(
                categoryId ? { categoryId } : undefined
            );
            setRows(data);
            setErr(null);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur lors du chargement des stocks.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">
            {}
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Inventaire</h1>
                {categoryId != null && (
                    <button
                        onClick={() => setCategoryId(undefined)}
                        className="text-sm text-blue-700 hover:underline"
                    >
                        Réinitialiser le filtre
                    </button>
                )}
            </div>

            {}
            <div className="flex-1 overflow-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
                <CategoryPickerCard
                    value={categoryId}
                    onChange={(id) => setCategoryId(id)}
                />

                <section className="bg-white rounded-xl shadow-md p-4 flex flex-col">
                    {}
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600">
                            {categoryId ? (
                                <>Filtre appliqué : <span className="font-semibold">Catégorie #{categoryId}</span></>
                            ) : (
                                <>Toutes les catégories</>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {err && <div className="text-red-600 mb-4">{err}</div>}
                        {loading ? (
                            <div className="text-center text-gray-500 py-10 animate-pulse">
                                Chargement des stocks…
                            </div>
                        ) : (
                            <StockTable data={rows} />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
