import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { venteService } from "../../api/frontOffice/venteService";
import { evenementService } from "../../api/frontOffice/evenementService";
import { stockFranchiseService } from "../../api/frontOffice/stockFranchiseService";
import { StockItem } from "../../assets/ts/FranchiseInterface";

type Vente = { id: string; montant: number | string; dateVente: string };
type StockLight = { produit: string; quantite: number; seuil?: number };
type EvenementLight = { id: string; titre: string; dateDebut: string };

const isoNow = () => new Date().toISOString();
const isoDaysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
};

export default function FranchiseDashboard() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ventes, setVentes] = useState<Vente[]>([]);
    const [stocksBas, setStocksBas] = useState<StockLight[]>([]);
    const [evenements, setEvenements] = useState<EvenementLight[]>([]);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);

            const ventesData = await venteService.list({
                from: isoDaysAgo(30),
                to: isoNow(),
            });
            setVentes(ventesData.data ?? []);

            const stocks = await stockFranchiseService.list({ page: 1, limit: 50 });
            const lowStocks = (stocks ?? [])
                .filter(
                    (s: StockItem) =>
                        typeof s.quantite === "number" &&
                        typeof s.produit?.seuil === "number" &&
                        s.quantite <= s.produit.seuil
                )
                .sort((a, b) => a.quantite - b.quantite)
                .slice(0, 5)
                .map((s: StockItem) => ({
                    produit: s.produit?.nom ?? "?",
                    quantite: s.quantite,
                    seuil: s.produit?.seuil,
                }));
            setStocksBas(lowStocks);

            const events = await evenementService.listEvenements({
                from: isoNow(),
                page: 1,
                limit: 5,
            });
            setEvenements(
                (events ?? []).map((e: any) => ({
                    id: e.id,
                    titre: e.titre,
                    dateDebut: e.dateDebut,
                }))
                    .slice(0, 5)
            );

            setError(null);
        } catch (e: any) {
            setError("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const ca30 = useMemo(
        () => ventes.reduce((s, r) => s + Number(r.montant || 0), 0),
        [ventes]
    );
    const nbVentes = ventes.length;

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {}
            <div className="px-6 py-5 border-b bg-white">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Tableau de bord
                        </h1>

                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate("/home-franchise/commandes-stocks")}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            Nouvelle commande stock
                        </button>

                        <button
                            onClick={() => navigate("/home-franchise/commandes")}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            Commandes clients
                        </button>
                        <button
                            onClick={() => navigate("/home-franchise/evenements")}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            Créer un événement
                        </button>
                    </div>
                </div>
            </div>

            {}
            <div className="p-6 space-y-6">
                {error && <div className="text-red-600">{error}</div>}
                {loading && (
                    <div className="text-gray-500 animate-pulse">Chargement…</div>
                )}

                {}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <Kpi title="CA / 30j" value={`${ca30.toFixed(2)} €`} />
                    <Kpi title="Ventes / 30j" value={String(nbVentes)}/>
                </div>

                {}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {}
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Stocks bas</h3>
                            <button
                                onClick={() => navigate("/home-franchise/stocks")}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Voir stocks
                            </button>
                        </div>
                        <ul className="mt-3 space-y-2">
                            {stocksBas.length === 0 && (
                                <li className="text-sm text-gray-500">RAS.</li>
                            )}
                            {stocksBas.map((s, i) => (
                                <li
                                    key={i}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span>{s.produit}</span>
                                    <span className="text-red-600 font-medium">
        {s.quantite}
      </span>
                                </li>
                            ))}
                        </ul>

                    </div>

                    {}
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Événements à venir</h3>
                            <button
                                onClick={() => navigate("/home-franchise/evenements")}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Gérer
                            </button>
                        </div>
                        <ul className="mt-3 space-y-2">
                            {evenements.length === 0 && (
                                <li className="text-sm text-gray-500">Aucun événement.</li>
                            )}
                            {evenements.map((e) => (
                                <li
                                    key={e.id}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span>{e.titre}</span>
                                    <span className="text-gray-600">
                    {new Date(e.dateDebut).toLocaleDateString("fr-FR")}
                  </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Kpi({title, value, hint }: { title: string; value: string; hint?: string }) {
    return (
        <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">{title}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
            {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
        </div>
    );
}
