import { useEffect, useState, useCallback, useMemo } from "react";
import { MaterialReactTable, useMaterialReactTable, MRT_ColumnDef } from "material-react-table";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";
import { articlePrixFranchiseService, ArticlePrixRow } from "../../../api/frontOffice/articlePrixFranchiseService";

export default function ArticlePrixPage() {
    const [rows, setRows] = useState<ArticlePrixRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const inStockOnly = true;
    const [actifsOnly, setActifsOnly] = useState(false);

    const [editMap, setEditMap] = useState<Record<string, { actif: boolean; prix_vente: number | null }>>({});

    const load = useCallback(async () => {
        setLoading(true); setErr(null);
        try {
            const data = await articlePrixFranchiseService.list({
                q: q || undefined,
                actifsOnly,
            });
            setRows(data);

            const m: Record<string, { actif: boolean; prix_vente: number | null }> = {};
            data.forEach((r) => {
                m[r.id] = { actif: r.actif, prix_vente: r.prix !== r.basePrice ? r.prix : null };
            });
            setEditMap(m);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    }, [q, inStockOnly, actifsOnly]);

    useEffect(() => { load(); }, [load]);

    const onChangeActif = (id: string, value: boolean) => {
        setEditMap((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { prix_vente: null, actif: false }), actif: value } }));
    };

    const onChangePrixVente = (id: string, valueStr: string) => {
        const value = valueStr.trim() === "" ? null : Number(valueStr);
        setEditMap((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { prix_vente: null, actif: false }), prix_vente: value } }));
    };

    const saveRow = async (row: ArticlePrixRow) => {
        try {
            const edit = editMap[row.id];
            await articlePrixFranchiseService.upsert(row.id, {
                actif: edit?.actif,
                prix_vente: edit?.prix_vente === null ? null : Number(edit?.prix_vente),
            });
            await load();
        } catch (e: any) {
            alert(e?.message ?? "Erreur lors de l’enregistrement");
        }
    };

    const columns = useMemo<MRT_ColumnDef<ArticlePrixRow>[]>(() => [
        { accessorKey: "nom", header: "Nom", size: 240 },
        {
            accessorKey: "category",
            header: "Catégorie",
            size: 160,
            Cell: ({ cell }) => cell.getValue<any>()?.nom ?? "—",
        },
        {
            accessorKey: "basePrice",
            header: "Prix catalogue",
            size: 120,
            Cell: ({ cell }) => `${Number(cell.getValue<number>()).toFixed(2)} €`,
        },
        {
            accessorKey: "prix",
            header: "Prix de vente",
            size: 150,
            Cell: ({ row }) => {
                const r = row.original;
                const current = editMap[r.id]?.prix_vente;
                return (
                    <input
                        type="number"
                        step="0.01"
                        className="border rounded px-2 py-1 w-28"
                        value={current === null ? "" : String(current)}
                        placeholder={String(r.basePrice)}
                        onChange={(e) => onChangePrixVente(r.id, e.target.value)}
                    />
                );
            },
        },
        {
            accessorKey: "actif",
            header: "Actif",
            size: 80,
            Cell: ({ row }) => {
                const r = row.original;
                const checked = !!editMap[r.id]?.actif;
                return (
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChangeActif(r.id, e.target.checked)}
                    />
                );
            },
        },
    ], [editMap]);

    const table = useMaterialReactTable<ArticlePrixRow>({
        columns,
        data: rows,
        initialState: { density: "compact" },
        enableGlobalFilter: false,
        enableRowActions: true,
        renderRowActions: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button onClick={() => saveRow(row.original)} className="bg-black text-white px-3 py-1 rounded">
                    Enregistrer
                </Button>
            </div>
        ),
        renderEmptyRowsFallback: () => <div className="p-4 text-center">Aucune donnée</div>,
    });

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Carte produits (prix franchise)</h1>

            <div className="flex items-end gap-3">
                <div className="w-64">
                    <label className="block text-sm text-gray-600 mb-1">Rechercher</label>
                    <Input
                        label=""
                        value={q}
                        onChange={(e: any) => setQ(e.target.value)}
                        placeholder="Nom, description…"
                    />
                </div>


                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={actifsOnly}
                        onChange={(e) => setActifsOnly(e.target.checked)}
                    />
                    Uniquement actifs
                </label>
            </div>

            {err && <div className="text-red-600">{err}</div>}
            {loading ? (
                <div className="text-gray-500">Chargement…</div>
            ) : (
                <MaterialReactTable table={table} />
            )}
        </div>
    );
}
