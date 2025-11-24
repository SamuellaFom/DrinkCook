import { useEffect, useState, useCallback } from "react";
import { camionService } from "../../../api/backOffice/camionService";
import { Camion } from "../../../assets/ts/interfaces";

export default function CamionDetail({ id }: { id: number }) {
  const [camion, setCamion] = useState<Camion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCamion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await camionService.getById(id);
      setCamion(data);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement du camion.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCamion();
  }, [fetchCamion]);

  if (loading) {
    return <div className="p-4 text-gray-600">Chargement des détails...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
        <button
          onClick={fetchCamion}
          className="ml-2 text-blue-600 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!camion) {
    return <div className="p-4 text-gray-500">Aucune donnée disponible.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md font-sans text-gray-900 space-y-8">
      <header className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold">{camion.immatriculation}</h1>
        <p className="text-sm text-gray-600">
          Kilométrage : {camion.kilometrage.toLocaleString()} km
        </p>
        <p className="text-xs text-gray-500 mt-1 select-none">
          Date d'achat :{" "}
          {new Date(camion.date_achat).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <span
          className={`inline-block mt-3 px-3 py-1 rounded-full text-white text-xs font-semibold capitalize ${
            camion.statut === "disponible"
              ? "bg-green-600"
              : camion.statut === "en_maintenance"
              ? "bg-yellow-500"
              : "bg-gray-400"
          }`}
        >
          {camion.statut.replace("_", " ")}
        </span>
      </header>

      <section>
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
          Informations techniques
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {camion.entretiens?.length > 0 ? (
            (() => {
              const lastRevision = camion.entretiens.reduce((latest, current) =>
                new Date(current.date_revision) > new Date(latest.date_revision)
                  ? current
                  : latest
              );
              const days =
                (Date.now() - new Date(lastRevision.date_revision).getTime()) /
                (1000 * 60 * 60 * 24);
              const cardColor =
                days < 180
                  ? "bg-green-50 border-green-200 hover:bg-green-100"
                  : days < 365
                  ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                  : "bg-red-50 border-red-200 hover:bg-red-100";

              return (
                <div
                  className={`rounded-md border p-4 transition ${cardColor}`}
                >
                  <p className="text-xs uppercase text-gray-500 flex items-center gap-2">
                    Dernière révision
                  </p>
                  <p className="font-semibold text-gray-800">
                    {new Date(lastRevision.date_revision).toLocaleDateString(
                      "fr-FR",
                      { day: "2-digit", month: "long", year: "numeric" }
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {Math.floor(days)} jours depuis la dernière révision
                  </p>
                  {lastRevision.realisé_par && (
                    <p className="text-xs text-gray-500 mt-1">
                      Réalisée par : {lastRevision.realisé_par}
                    </p>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
              <span className="block text-gray-500">Dernière révision</span>
              <span className="text-sm text-gray-600">Non renseignée</span>
            </div>
          )}

          <div className="rounded-xl border p-4 bg-gray-50 hover:bg-gray-100 transition">
            {camion.franchise ? (
              <>
                <p className="text-xs uppercase text-gray-500 mb-2">
                  Franchise
                </p>
                <h3 className="text-base font-semibold text-gray-800">
                  {camion.franchise.nom}
                </h3>
                <p className="text-sm text-gray-600">
                  SIRET : {camion.franchise.siret}
                </p>
                <p className="text-sm text-gray-600">
                  📍 {camion.franchise.ville}, {camion.franchise.code_postal}
                </p>
                <span
                  className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    camion.franchise.statut === "active"
                      ? "bg-green-100 text-green-800"
                      : camion.franchise.statut === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {camion.franchise.statut}
                </span>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Aucune franchise assignée</p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
          Emplacement actuel
        </h2>
        {camion.emplacements?.length > 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm">
            <span className="block text-gray-500">Dépôt assigné</span>
            <span className="font-medium">
              {camion.emplacements.at(-1)?.emplacement?.nom} -{" "}
              {camion.emplacements.at(-1)?.emplacement?.ville}
            </span>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Aucun emplacement assigné</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
          Carnet d’entretien
        </h2>
        {camion.entretiens?.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {camion.entretiens
              .sort(
                (a, b) =>
                  new Date(b.date_revision).getTime() -
                  new Date(a.date_revision).getTime()
              )
              .map((e) => (
                <li key={e.id} className="py-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {e.description}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(e.date_revision).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {e.kilometrage ? `${e.kilometrage} km – ` : ""}
                    {e.realisé_par || "Atelier inconnu"}
                  </p>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Aucun entretien enregistré</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
          Pannes déclarées
        </h2>
        {camion.pannes?.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {camion.pannes
              .sort(
                (a, b) =>
                  new Date(b.date_panne).getTime() -
                  new Date(a.date_panne).getTime()
              )
              .map((p) => (
                <li key={p.id} className="py-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        p.statut === "declarée"
                          ? "bg-yellow-100 text-yellow-800"
                          : p.statut === "en_cours"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {p.statut.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(p.date_panne).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{p.description}</p>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Aucune panne déclarée</p>
        )}
      </section>
    </div>
  );
}