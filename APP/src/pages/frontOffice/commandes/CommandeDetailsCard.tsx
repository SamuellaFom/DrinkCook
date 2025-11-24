import { useEffect, useState, useCallback } from "react";
import { commandeClientService, type CommandeClient } from "../../../api/frontOffice/commandeClientService";

export default function CommandeClientDetailsCard({
                                                      id,
                                                      onPaid,
                                                      onCanceled,
                                                  }: {
    id: string;
    onPaid?: () => void;
    onCanceled?: () => void;
}) {
    const [data, setData] = useState<CommandeClient | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setErr(null);
        try {
            const d = await commandeClientService.getById(id);
            setData(d);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    if (!id) return null;
    if (loading) return <div className="p-4">Chargement…</div>;
    if (err) return <div className="p-4 text-red-600">{err}</div>;
    if (!data) return null;

    const fmt = (n: number) => `${Number(n ?? 0).toFixed(2)} €`;
    const brut = Number(data.montantTotal ?? 0);
    const vente = (data as any).vente as { remiseFidelite: number; montantNet: number } | null | undefined;

    const isPending = data.statut === "en_attente";
    const flagUse = Boolean((data as any).utiliserPointsFidelite);
    const PREVIEW_DISCOUNT = 5;
    const hasVente = !!vente;
    const showPreview = isPending && flagUse && !hasVente;

    let remiseAff = 0;
    let netAff = brut;
    let remiseLabel = "Remise fidélité";
    if (hasVente) {
        remiseAff = Number(vente?.remiseFidelite ?? 0);
        netAff = Number(vente?.montantNet ?? Math.max(0, brut - remiseAff));
    } else if (showPreview) {
        remiseAff = PREVIEW_DISCOUNT;
        netAff = Math.max(0, brut - PREVIEW_DISCOUNT);
        remiseLabel = "Remise fidélité ";
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
                <div className="font-semibold">Commande #{data.id}</div>
                <div className="text-sm text-gray-600">{new Date(data.dateCommande).toLocaleString("fr-FR")}</div>
                <div className="mt-1"><span className="text-xs px-2 py-0.5 rounded bg-gray-100">{data.statut}</span></div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
                <div className="font-semibold mb-2">Client</div>
                {data.client ? (
                    <div className="text-sm text-gray-700">
                        {data.client.nom} {data.client.email ? `— ${data.client.email}` : ""}
                    </div>
                ) : (
                    <div className="text-gray-400 italic">Guest</div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow p-4">
                <div className="font-semibold mb-2">Lignes</div>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-gray-500">
                        <th>Produit</th><th>Qté</th><th>PU</th><th>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.lignes?.map((l: any) => (
                        <tr key={l.id} className="border-t">
                            <td className="py-2">{l.produit?.nom ?? l.produit?.id}</td>
                            <td className="py-2">{l.quantite}</td>
                            <td className="py-2">{Number(l.prixUnitaire).toFixed(2)} €</td>
                            <td className="py-2 font-semibold">
                                {(Number(l.prixUnitaire) * Number(l.quantite)).toFixed(2)} €
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {(data as any).menus && (data as any).menus.length > 0 && (
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="font-semibold mb-2">Menus</div>
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-left text-gray-500">
                            <th>Menu</th><th>Qté</th><th>PU</th><th>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(data as any).menus.map((l: any) => (
                            <tr key={l.id} className="border-t">
                                <td className="py-2">{l.menu?.nom ?? l.menu?.id}</td>
                                <td className="py-2">{l.quantite}</td>
                                <td className="py-2">{Number(l.prixUnitaire).toFixed(2)} €</td>
                                <td className="py-2 font-semibold">
                                    {(Number(l.prixUnitaire) * Number(l.quantite)).toFixed(2)} €
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="bg-white rounded-xl shadow p-4">
                <div className="font-semibold mb-2">Résumé</div>
                <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between"><span>Total brut</span><span className="font-medium">{fmt(brut)}</span></div>
                    {(hasVente || showPreview) && (
                        <div className="flex justify-between text-gray-700">
                            <span>{remiseLabel}</span><span className="font-medium">− {fmt(remiseAff)}</span>
                        </div>
                    )}
                    <div className="border-t my-2" />
                    <div className="flex justify-between text-base">
                        <span className="font-semibold">Total {hasVente ? "payé" : "à payer"}</span>
                        <span className="font-bold">{fmt(netAff)}</span>
                    </div>
                </div>
            </div>

            {data.statut === "en_attente" && (
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={async () => {
                            try { await commandeClientService.pay(id); onPaid?.(); }
                            catch (e: any) { alert(e?.message ?? "Erreur paiement"); }
                        }}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                        Payer
                    </button>
                    <button
                        onClick={async () => {
                            try { await commandeClientService.cancel(id); onCanceled?.(); }
                            catch (e: any) { alert(e?.message ?? "Erreur annulation"); }
                        }}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Annuler
                    </button>
                </div>
            )}
        </div>
    );
}
