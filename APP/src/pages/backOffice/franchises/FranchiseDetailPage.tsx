import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { franchiseService } from "../../../api/backOffice/franchiseService";
import { Franchise } from "../../../assets/ts/interfaces";

type BarChartProps = {
  data: { label: string; total: number }[];
};

function BarChart({ data }: BarChartProps) {
  if (!data || data.length === 0)
    return (
      <div className="text-center text-gray-500">
        Aucune donnée pour le graphique.
      </div>
    );

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg shadow-sm border-b border-gray-200">
      {data.map(({ label, total }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="w-16 text-xs text-gray-600">{label}</div>
          <div className="flex-1 bg-gray-200 h-5 rounded overflow-hidden">
            <div
              className="h-5 rounded transition-all"
              style={{
                width: `${(total / max) * 100}%`,
                backgroundColor: `hsl(${(i * 60) % 360}, 65%, 55%)`,
              }}
              title={`${label}: ${total.toFixed(2)} €`}
            />
          </div>
          <div className="w-16 text-right text-xs text-gray-700">
            {total.toFixed(2)} €
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FranchiseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [caView, setCaView] = useState<"mois" | "semaine">("mois");
  const [displayMode, setDisplayMode] = useState<"graph" | "table">("graph");

  const fetchFranchise = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await franchiseService.getById(id!);
      setFranchise(data);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement de la franchise.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFranchise();
  }, [fetchFranchise]);

  const caData = useMemo(() => {
    if (!franchise?.ventes) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (caView === "mois") {
      return Array.from({ length: 12 }, (_, i) => {
        const total = franchise.ventes
          .filter((c) => {
            const date = new Date(c.dateVente);
            return date.getMonth() === i && date.getFullYear() === currentYear;
          })
          .reduce((sum, c) => sum + Number(c.montant || 0), 0);
        return {
          label: new Date(0, i).toLocaleString("fr-FR", { month: "short" }),
          total,
        };
      });
    } else {
      const weeks: Record<number, number> = {};
      franchise.ventes
        .filter((c) => {
          const d = new Date(c.dateVente);
          return (
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        })
        .forEach((c) => {
          const d = new Date(c.dateVente);
          const week = Math.ceil((d.getDate() + 6 - d.getDay()) / 7); 
          weeks[week] = (weeks[week] || 0) + Number(c.montant || 0);
        });

      return Object.entries(weeks).map(([week, total]) => ({
        label: `S${week}`,
        total,
      }));
    }
  }, [franchise, caView]);

  const lastCommandes = useMemo(() => {
    if (!franchise?.commandesStocks) return [];
    return [...franchise.commandesStocks]
      .sort(
        (a, b) =>
          new Date(b.date_commande).getTime() -
          new Date(a.date_commande).getTime()
      )
      .slice(0, 10);
  }, [franchise]);

  if (loading)
    return <div className="p-6 text-gray-600 text-center">Chargement...</div>;
  if (error)
    return (
      <div className="p-6 text-red-600 text-center">
        {error}{" "}
        <button
          onClick={fetchFranchise}
          className="ml-2 text-blue-600 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  if (!franchise)
    return <div className="p-6 text-gray-500 text-center">Aucune donnée.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold">{franchise.nom}</h1>
          <p className="text-sm text-gray-600">
            {franchise.adresse}, {franchise.code_postal} {franchise.ville}
          </p>
          <p className="text-xs text-gray-500 mt-1 select-none">
            SIRET : {franchise.siret}
          </p>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-white text-xs font-semibold capitalize ${
              franchise.statut === "active"
                ? "bg-green-600"
                : franchise.statut === "en_attente"
                ? "bg-yellow-500"
                : "bg-gray-400"
            }`}
          >
            {franchise.statut}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${
              displayMode === "graph" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setDisplayMode("graph")}
          >
            Graphique
          </button>
          <button
            className={`px-3 py-1 rounded ${
              displayMode === "table" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setDisplayMode("table")}
          >
            Tableau
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${
              caView === "mois" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setCaView("mois")}
          >
            Par mois
          </button>
          <button
            className={`px-3 py-1 rounded ${
              caView === "semaine" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setCaView("semaine")}
          >
            Par semaine
          </button>
        </div>
      </div>

      {displayMode === "graph" ? (
        <BarChart data={caData} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-2">
          {caData.map(({ label, total }) => (
            <div
              key={label}
              className="bg-gray-50 rounded-lg p-3 text-center shadow-sm"
            >
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-lg font-semibold">{total.toFixed(2)} €</div>
            </div>
          ))}
        </div>
      )}

      {franchise.users.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Employés associés</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-4">
            {franchise.users.map((user) => (
              <div
                key={user.id}
                className="bg-blue-50 p-4 rounded-lg shadow-sm"
              >
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="mt-1 text-xs text-gray-700 capitalize">
                  {user.role}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Camion associé</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {franchise.camion && (
            <div
              key={franchise.camion.id}
              className="flex-shrink-0 bg-yellow-50 border border-gray-200 rounded-md px-4 py-2 text-sm font-medium text-gray-700"
            >
              <div>{franchise.camion.immatriculation}</div>
              <div
                className={`mt-1 inline-block px-2 py-0.5 rounded text-xs text-white capitalize ${
                  franchise.camion.statut === "disponible"
                    ? "bg-emerald-600"
                    : "bg-amber-500"
                }`}
              >
                {franchise.camion.statut.replace("_", " ")}
              </div>
            </div>
          )}
        </div>
      </section>

      {lastCommandes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">
            10 dernières réapprovisionnements{" "}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Entrepôt</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Montant (€)</th>
                  <th className="px-4 py-2">Produits</th>
                </tr>
              </thead>
              <tbody>
                {lastCommandes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      {new Date(c.date_commande).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-2">
                      {c.entrepot?.nom || "Externe"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-white text-xs font-semibold ${
                          c.statut === "valide"
                            ? "bg-green-600"
                            : c.statut === "soumise"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {c.statut}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {Number(c.montant_total ?? 0).toFixed(2)} €
                    </td>
                    <td className="px-4 py-2">
                      <ul className="list-disc list-inside space-y-1">
                        {c.produits.map((p) => (
                          <li key={p.id}>
                            {p.produit.nom} — Qté: {p.quantite} — Prix:{" "}
                            {p.prix_unitaire} €
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="text-gray-400 text-xs italic mt-6">
        Créé le :{" "}
        {new Date(franchise.createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </footer>
    </div>
  );
}