import { useEffect, useState, useCallback } from "react";
import { entrepotService } from "../../../api/backOffice/entrepotService";
import { Entrepot } from "../../../assets/ts/interfaces";

export default function EntrepotDetail({ id }: { id: number }) {
  const [entrepot, setEntrepot] = useState<Entrepot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntrepot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await entrepotService.getById(id);
      setEntrepot(data);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement de l'entrepot.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntrepot();
  }, [fetchEntrepot]);

  if (loading) {
    return <div className="p-4 text-gray-600">Chargement des détails...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
        <button
          onClick={fetchEntrepot}
          className="ml-2 text-blue-600 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!entrepot) {
    return <div className="p-4 text-gray-500">Aucune donnée disponible.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md font-sans text-gray-900">
      {/* HEADER */}
      <header className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold mb-1">{entrepot.nom}</h1>
        <p className="text-sm text-gray-600">
          {entrepot.adresse}, {entrepot.code_postal} {entrepot.ville}
        </p>
      </header>

      {/* STOCKS */}
      {/* {entrepot.stocks && entrepot.stocks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
            Stocks disponibles
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Produit</th>
                  <th className="px-4 py-2">Quantité</th>
                  <th className="px-4 py-2">Prix unitaire (€)</th>
                </tr>
              </thead>
              <tbody>
                {entrepot.stocks.map((stock) => (
                  <tr
                    key={stock.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{stock.produit.nom}</td>
                    <td className="px-4 py-2">{stock.quantite}</td>
                    <td className="px-4 py-2">{stock.produit.prix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}*/}

      {entrepot.commandesStocks && entrepot.commandesStocks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-6">
            Historique des commandes
          </h2>
          <ol className="relative border-l border-gray-300 ml-4 space-y-8">
            {entrepot.commandesStocks
              .sort(
                (a, b) =>
                  new Date(b.date_commande).getTime() -
                  new Date(a.date_commande).getTime()
              )
              .map((commande) => (
                <li key={commande.id} className="mb-4 pl-6">
                  <span className="absolute -left-3 top-1 w-6 h-6 bg-blue-600 rounded-full border-2 border-white"></span>
                  <div className="mb-1 font-semibold">
                    Commande #{commande.id_formatted}
                  </div>
                  <time className="block mb-1 text-xs text-gray-500">
                    {new Date(commande.date_commande).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </time>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-white text-xs font-semibold capitalize ${
                      commande.statut === "valide"
                        ? "bg-green-600"
                        : commande.statut === "en_attente"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {commande.statut}
                  </span>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    {commande.produits.map((prod) => (
                      <li key={prod.id}>
                        {prod.produit.nom} — Qté : {prod.quantite} — Prix
                        unitaire : {prod.prix_unitaire} €
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ol>
        </section>
      )}
    </div>
  );
}