import { useEffect, useState, useCallback } from "react";
import { clientService } from "../../../api/frontOffice/clientService";

type Props = { id: string; onClose?: () => void };

export default function ClientDetailsDrawer({ id }: Props) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setErr(null);
        try {
            const details = await clientService.getDetails(id);
            setData(details);
        } catch (e: any) {
            setErr(e.message ?? "Erreur");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className="p-4">Chargement…</div>;
    if (err) return <div className="p-4 text-red-600">{err}</div>;
    if (!data) return null;

    const totalPoints = Number(data.cartesFidelite?.[0]?.points ?? 0);

    return (
        <div className="space-y-6">
            {}
            <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">{data.nom}</h1>
                        <div className="text-gray-700">
                            {data.email} • {data.telephone ?? "—"}
                        </div>
                        <div className="text-gray-500 text-sm">
                            Créé le {new Date(data.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                    </div>
                    {}
                    <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
                        {totalPoints} pts
                    </div>
                </div>
            </div>

            {}
            <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-1">Carte fidélité</h2>
                <div className="text-2xl font-bold">{totalPoints} pts</div>
            </div>

            {}
            <div className="bg-white rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold mb-3">Ventes récentes</h2>
                {data.ventes?.length ? (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-left text-gray-500">
                            <th>Date</th>
                            <th>Net</th>
                            <th>Remise</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.ventes.map((v: any) => (
                            <tr key={v.id} className="border-t">
                                <td className="py-2">
                                    {new Date(v.dateVente).toLocaleDateString("fr-FR")}
                                </td>
                                <td className="py-2 font-semibold">
                                    {Number(v.montant).toFixed(2)} €
                                </td>
                                <td className="py-2">
                                    {Number(v.remiseFidelite ?? 0).toFixed(2)} €
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-gray-500">Aucune vente</div>
                )}
            </div>
        </div>
    );
}
