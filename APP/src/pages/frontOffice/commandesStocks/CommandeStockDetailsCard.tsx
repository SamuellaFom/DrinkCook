import { useEffect, useState, useCallback } from "react";
import {commandeStockService} from "../../../api/frontOffice/commandeStockService";
import {CommandeStock, StatutCommandeStock} from "../../../assets/ts/FranchiseInterface";


export default function CommandeStockDetailsCard({
                                                     id,
                                                     onSubmitted,
                                                     onReceived,
                                                     onDeleted,
                                                     onEdit,
                                                 }: {
    id: number;
    onSubmitted?: () => void;
    onReceived?: () => void;
    onDeleted?: () => void;
    onEdit?: (id: number) => void;
}) {
    const [data, setData] = useState<CommandeStock | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
            setLoading(true);
            setErr(null);
            try {
                const d = await commandeStockService.getById(id);
                setData(d);
            } catch (e: any) {
                setErr(e.message ?? "Erreur");
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

    const st = data.statut as StatutCommandeStock;

    const canEdit    = st === StatutCommandeStock.EN_COURS;
    const canSubmit  = st === StatutCommandeStock.EN_COURS;
    const canReceive = st === StatutCommandeStock.VALIDE;
    const canDelete  = st === StatutCommandeStock.EN_COURS;

    const badgeClass =
        st === StatutCommandeStock.EN_COURS ? "bg-yellow-100 text-yellow-800" :
            st === StatutCommandeStock.SOUMISE  ? "bg-orange-100 text-orange-800" :
                st === StatutCommandeStock.VALIDE   ? "bg-indigo-100 text-indigo-800" :
                    st === StatutCommandeStock.LIVREE   ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800";

    const label =
        st === StatutCommandeStock.EN_COURS ? "Brouillon" :
            st === StatutCommandeStock.SOUMISE  ? "Soumise" :
                st === StatutCommandeStock.VALIDE   ? "Validée" :
                    st === StatutCommandeStock.LIVREE   ? "Réceptionnée" :
                        "Annulée";

    return (

        <div className="space-y-4">
            {}
            {}
            {}
            <div className="bg-white rounded-xl shadow p-4">
                <div className="font-semibold">Commande stock #{data.id_formatted}</div>

                <div className="text-sm text-gray-600">
                    {data.date_reception
                        ? `Réception : ${new Date(data.date_reception).toLocaleString("fr-FR")}`
                        : ` ${new Date(data.date_commande).toLocaleString("fr-FR")}`}
                </div>

                <div className="mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${badgeClass}`}>{label}</span>
                </div>

                <div className="text-sm text-gray-600 mt-1">
                    Entrepôt : {data.entrepot?.nom ?? "Achat direct (aucun entrepôt)"}
                </div>
            </div>





            {}
            <div className="bg-white rounded-xl shadow p-4">
                <div className="font-semibold mb-2">Lignes</div>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-gray-500">
                        <th>Produit</th>
                        <th>Qté</th>
                        <th>PU</th>
                        <th>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.produits?.map((l) => (
                        <tr key={l.id} className="border-t">
                            <td className="py-2">{l.produit?.nom ?? l.produit?.id}</td>
                            <td className="py-2">{l.quantite}</td>
                            <td className="py-2">{Number(l.prix_unitaire).toFixed(2)} €</td>
                            <td className="py-2 font-semibold">
                                {(Number(l.prix_unitaire) * Number(l.quantite)).toFixed(2)} €
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="text-right mt-2 font-bold">
                    Total : {Number(data.montant_total ?? 0).toFixed(2)} €
                </div>
            </div>

            {}
            <div className="flex gap-2 justify-end">
                {}
                {onEdit && canEdit && (
                    <button
                        onClick={() => onEdit(data.id)}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                        type="button"
                    >
                        Modifier
                    </button>
                )}

                {}
                {canSubmit && (
                    <button
                        onClick={async () => {
                            try {
                                await commandeStockService.submit(data.id);
                                onSubmitted ? onSubmitted() : load();
                            } catch (e: any) {
                                alert(e.message ?? "Erreur soumission");
                            }
                        }}
                        className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700"
                        type="button"
                    >
                        Soumettre
                    </button>
                )}

                {}
                {canReceive && (
                    <button
                        onClick={async () => {
                            try {
                                await commandeStockService.receive(data.id);
                                onReceived ? onReceived() : load();
                            } catch (e: any) {
                                alert(e.message ?? "Erreur réception");
                            }
                        }}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                        type="button"
                    >
                        Réceptionner
                    </button>
                )}

                {}
                {canDelete && (
                    <button
                        onClick={async () => {
                            try {
                                if (window.confirm("Supprimer ce brouillon ?")) {
                                    await commandeStockService.remove(data.id);
                                    onDeleted ? onDeleted() : load();
                                }
                            } catch (e: any) {
                                alert(e.message ?? "Erreur suppression");
                            }
                        }}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                        type="button"
                    >
                        Supprimer
                    </button>
                )}
            </div>
        </div>
    );
}
