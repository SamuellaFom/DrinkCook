import { useEffect, useState, useCallback } from "react";
import { panneService } from "../../../api/backOffice/panneService";
import { Panne } from "../../../assets/ts/interfaces";

export default function PanneDetail({ id }: { id: number }) {
  const [panne, setPanne] = useState<Panne | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPanne = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await panneService.getById(id);
      setPanne(data);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement de la panne.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPanne();
  }, [fetchPanne]);

  if (loading) {
    return <div className="p-6 text-gray-600 text-center">Chargement…</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 text-center">
        {error}{" "}
        <button
          onClick={fetchPanne}
          className="ml-2 text-indigo-600 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!panne) {
    return <div className="p-6 text-gray-500 text-center">Aucune donnée.</div>;
  }

  const formatDate = (d?: Date | null) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";

  const statutClass =
    panne.statut === "reparéee"
      ? "bg-green-100 text-green-700 border-green-200"
      : panne.statut === "en_cours"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl border border-gray-100 font-sans text-gray-900 space-y-8 transition hover:shadow-2xl">
      <header className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Détails de la panne
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Créée le {formatDate(panne.created_at)}
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Date de la panne
          </h2>
          <p className="text-lg font-semibold mt-1">
            {formatDate(panne.date_panne)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Statut
          </h2>
          <span
            className={`mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full tracking-wide uppercase border ${statutClass}`}
          >
            {panne.statut}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <h2 className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
            Camion
          </h2>
          <div className="mt-1">
            <div className="text-base font-semibold">
              {panne.camion?.immatriculation ?? "-"}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {panne.camion?.kilometrage != null
                ? `${panne.camion.kilometrage.toLocaleString()} km`
                : ""}
            </div>
            {panne.camion?.date_achat && (
              <div className="text-xs text-gray-600">
                Acheté le {formatDate(panne.camion.date_achat)}
              </div>
            )}
            {panne.camion?.statut && (
              <span className="mt-2 inline-block text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                {panne.camion.statut}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="p-5 rounded-xl bg-gray-50 border border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Description
        </h2>
        <p className="text-gray-800 leading-relaxed">
          {panne.description || "Aucune description fournie."}
        </p>
      </section>
    </div>
  );
}