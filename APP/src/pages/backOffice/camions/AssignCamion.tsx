import React, { useEffect, useState } from "react";
import { camionService } from "../../../api/backOffice/camionService";
import { Camion } from "../../../assets/ts/interfaces";

type Emplacement = {
  id: number;
  nom?: string | null;
  adresse?: string | null;
  ville?: string | null;
};

export default function AssignCamionForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [camions, setCamions] = useState<Camion[]>([]);
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [camionId, setCamionId] = useState<number | "">("");
  const [emplacementId, setEmplacementId] = useState<number | "">("");
  const [loadingLists, setLoadingLists] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchLists() {
      setLoadingLists(true);
      setError(null);
      try {
        const [camionsData, emplacementsData] = await Promise.all([
          camionService.getInfosCamions(),
          camionService.getInfosEmplacements(),
        ]);
        if (!mounted) return;
        setCamions(camionsData || []);
        setEmplacements(emplacementsData || []);
      } catch (err: any) {
        console.error("Erreur chargement listes :", err);
        setError("Impossible de charger les camions / emplacements.");
      } finally {
        if (mounted) setLoadingLists(false);
      }
    }
    fetchLists();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (camionId === "" || emplacementId === "") {
      setError("Veuillez sélectionner un camion et un emplacement");
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        camionId: Number(camionId),
        emplacementId: Number(emplacementId),
      };
      await camionService.createEmplacement(data);
      setMessage("Camion assigné avec succès !");
      setCamionId("");
      setEmplacementId("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Erreur assignation :", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de l'assignation";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCamion = camions.find((c) => c.id === Number(camionId));
  const selectedEmplacement = emplacements.find(
    (em) => em.id === Number(emplacementId)
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6 font-sans"
    >
      {loadingLists ? (
        <p className="text-sm text-gray-500">Chargement des listes…</p>
      ) : (
        <>
          {error && (
            <div className="text-sm text-red-600 font-medium">{error}</div>
          )}
          {message && (
            <div className="text-sm text-green-600 font-medium">{message}</div>
          )}

          <div className="flex flex-col">
            <label
              htmlFor="camion"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Camion
            </label>
            <select
              id="camion"
              value={camionId}
              onChange={(e) =>
                setCamionId(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={submitting || camions.length === 0}
              aria-invalid={camionId === ""}
            >
              <option value="">Sélectionnez un camion</option>
              {camions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.immatriculation}{" "}
                  {c.kilometrage
                    ? `• ${c.kilometrage.toLocaleString()} km`
                    : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Immatriculation et kilométrage
            </p>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="emplacement"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Emplacement
            </label>
            <select
              id="emplacement"
              value={emplacementId}
              onChange={(e) =>
                setEmplacementId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={submitting || emplacements.length === 0}
              aria-invalid={emplacementId === ""}
            >
              <option value="">Sélectionnez un emplacement</option>
              {emplacements.map((em) => (
                <option key={em.id} value={em.id}>
                  {em.nom ?? `Emplacement ${em.id}`}{" "}
                  {em.ville ? `• ${em.ville}` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Nom et ville / adresse</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500">Camion sélectionné</div>
              <div className="font-medium text-gray-800">
                {selectedCamion ? selectedCamion.immatriculation : "—"}
              </div>
              {selectedCamion?.kilometrage != null && (
                <div className="text-xs text-gray-500">
                  {selectedCamion.kilometrage.toLocaleString()} km
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500">
                Emplacement sélectionné
              </div>
              <div className="font-medium text-gray-800">
                {selectedEmplacement
                  ? selectedEmplacement.nom ??
                    `Emplacement ${selectedEmplacement.id}`
                  : "—"}
              </div>
              {selectedEmplacement?.ville && (
                <div className="text-xs text-gray-500">
                  {selectedEmplacement.ville}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || camionId === "" || emplacementId === ""}
            className={`w-full mt-2 py-2 rounded-lg font-semibold transition ${
              submitting || camionId === "" || emplacementId === ""
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {submitting ? "Assignation..." : "Assigner le camion"}
          </button>
        </>
      )}
    </form>
  );
}