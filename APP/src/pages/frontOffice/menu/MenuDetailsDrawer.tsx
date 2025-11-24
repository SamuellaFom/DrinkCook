import { useEffect, useState, useCallback } from "react";
import { menuService } from "../../../api/frontOffice/menuService";

type Props = { id: string; onClose?: () => void };

export default function MenuDetailsDrawer({ id }: Props) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setErr(null);
        try {
            const m = await menuService.getById(id);
            setData(m);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) return <div className="p-4">Chargement…</div>;
    if (err) return <div className="p-4 text-red-600">{err}</div>;
    if (!data) return null;

    const lignes = (data.lignes ?? []).map((l: any) => ({
        produitNom: l.produit?.nom ?? l.produitNom ?? "Produit",
        quantite: Number(l.quantite ?? 0),
    }));

    return (
        <div className="space-y-6">
            {}
            <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">{data.nom}</h1>
                        <div className="text-gray-700">{data.description || "—"}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-semibold">{Number(data.prix).toFixed(2)} €</div>
                        <div className={`mt-1 px-2 py-0.5 rounded-full text-sm ${data.actif ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                            {data.actif ? "Actif" : "Inactif"}
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-3">Composition du menu</h2>
                {lignes.length ? (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-left text-gray-500">
                            <th>Produit</th>
                            <th>Quantité</th>
                        </tr>
                        </thead>
                        <tbody>
                        {lignes.map((l: any, idx: number) => (
                            <tr key={idx} className="border-t">
                                <td className="py-2">{l.produitNom}</td>
                                <td className="py-2">{l.quantite}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-gray-500">Aucune ligne</div>
                )}
            </div>
        </div>
    );
}
