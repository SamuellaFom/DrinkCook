import { useCallback, useEffect, useMemo, useState } from "react";
import {Vente} from "../../../assets/ts/FranchiseInterface";
import {venteService} from "../../../api/frontOffice/venteService";
import Button from "../../../components/basics/Button";
import VenteTable from "../../../components/frontOffice/ventes/VenteTable";


const toISOStart = (d: string) => new Date(`${d}T00:00:00`).toISOString();
const toISOExclusiveEnd = (d: string) => {
    const dt = new Date(`${d}T00:00:00`);
    dt.setDate(dt.getDate() + 1);
    return dt.toISOString();
};

export default function VenteListPage() {
    const [rows, setRows] = useState<Vente[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");

    const fetchRows = useCallback(async (p?: { from?: string; to?: string }) => {
        try {
            setLoading(true);
            const res = await venteService.list(p);
            setRows(res.data);
            setTotal(res.meta.total);
            setErr(null);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur chargement ventes");
            setRows([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    const count = rows.length;
    const totalFmt = useMemo(() => `${Number(total).toFixed(2)} €`, [total]);

    const applyFilters = () => {
        const params: any = {};
        if (from) params.from = toISOStart(from);
        if (to)   params.to   = toISOExclusiveEnd(to);
        fetchRows(params);
    };

    const clearFilters = () => {
        setFrom("");
        setTo("");
        fetchRows();
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">
            <div className="px-8 py-6 border-b border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Ventes</h1>

                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600">Du</label>
                        <input
                            type="date"
                            className="rounded border px-3 py-2 bg-white"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600">Au</label>
                        <input
                            type="date"
                            className="rounded border px-3 py-2 bg-white"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                    <Button onClick={applyFilters} className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-md">
                        Filtrer
                    </Button>
                    <Button onClick={clearFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-md">
                        Réinitialiser
                    </Button>
                </div>
            </div>

            <div className="px-8 pt-4 text-sm text-gray-600">
                <span className="mr-4">Nombre de ventes : <strong>{count}</strong></span>
                <span>Total : <strong>{totalFmt}</strong></span>
            </div>

            <div className="flex-1 overflow-auto px-8 py-4">
                {err && <div className="text-red-600 mb-4">{err}</div>}
                {loading ? (
                    <div className="text-center text-gray-500 py-10 animate-pulse">Chargement des ventes…</div>
                ) : (
                    <VenteTable data={rows} />
                )}
            </div>
        </div>
    );
}
