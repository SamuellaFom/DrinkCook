import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clientService } from "../../../api/frontOffice/clientService";

export default function ClientDetailsPage() {
    const { id } = useParams<{ id:string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string|null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setErr(null);
        try {
            const details = await clientService.getDetails(id);
            setData(details);
        } catch (e:any) {
            setErr(e.message ?? "Erreur");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className="p-6">Chargement…</div>;
    if (err) return <div className="p-6 text-red-600">{err}</div>;
    if (!data) return null;

    return (
        <div className="p-6 space-y-6">
            <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">← Retour</button>

            <div className="bg-white rounded-xl shadow p-4">
                <h1 className="text-2xl font-bold mb-2">{data.nom}</h1>
                <div className="text-gray-700">{data.email} • {data.telephone ?? "—"}</div>
                <div className="text-gray-500 text-sm">Créé le {new Date(data.createdAt).toLocaleDateString("fr-FR")}</div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-4">
                    <h2 className="text-lg font-semibold mb-3">Cartes de fidélité</h2>
                    {data.cartesFidelite?.length ? (
                        <table className="w-full text-sm">
                            <thead><tr className="text-left text-gray-500"><th>Franchise</th><th>Points</th></tr></thead>
                            <tbody>
                            {data.cartesFidelite.map((c:any) => (
                                <tr key={c.id} className="border-t">
                                    <td className="py-2">{c.franchise?.nom ?? c.franchise?.id}</td>
                                    <td className="py-2 font-semibold">{c.points}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : <div className="text-gray-500">Aucune carte</div>}
                </div>

                <div className="bg-white rounded-xl shadow p-4">
                    <h2 className="text-lg font-semibold mb-3">Commandes récentes</h2>
                    {data.commandes?.length ? (
                        <table className="w-full text-sm">
                            <thead><tr className="text-left text-gray-500"><th>ID</th><th>Date</th><th>Statut</th><th>Total</th></tr></thead>
                            <tbody>
                            {data.commandes.map((cmd:any) => (
                                <tr key={cmd.id} className="border-t">
                                    <td className="py-2">{cmd.id}</td>
                                    <td className="py-2">{new Date(cmd.dateCommande).toLocaleDateString("fr-FR")}</td>
                                    <td className="py-2">{cmd.statut}</td>
                                    <td className="py-2">{Number(cmd.montantTotal).toFixed(2)} €</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : <div className="text-gray-500">Aucune commande</div>}
                </div>

                <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-3">Ventes récentes</h2>
                    {data.ventes?.length ? (
                        <table className="w-full text-sm">
                            <thead><tr className="text-left text-gray-500"><th>Date</th><th>Montant</th><th>Franchise</th></tr></thead>
                            <tbody>
                            {data.ventes.map((v:any) => (
                                <tr key={v.id} className="border-t">
                                    <td className="py-2">{new Date(v.dateVente).toLocaleDateString("fr-FR")}</td>
                                    <td className="py-2">{Number(v.montant).toFixed(2)} €</td>
                                    <td className="py-2">{v.franchise?.nom ?? v.franchise?.id}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : <div className="text-gray-500">Aucune vente</div>}
                </div>
            </div>
        </div>
    );
}
