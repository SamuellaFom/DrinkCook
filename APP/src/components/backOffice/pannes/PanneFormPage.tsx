import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { panneService } from "../../../api/backOffice/panneService";
import { camionService } from "../../../api/backOffice/camionService";
import Button from "../../../components/basics/Button";
import Input from "../../basics/Input";

type PanneFormValues = {
  description: string;
  date_panne: string;
  statut: string;
  camion: string;
};

export default function PanneForm({
  id,
  onSuccess,
}: {
  id?: number;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PanneFormValues>({
    defaultValues: {
      description: "",
      date_panne: "",
      statut: "",
      camion: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [camions, setCamions] = useState<
    { id: string; immatriculation: string }[]
  >([]);

  useEffect(() => {
    async function fetchCamions() {
      try {
        const camionsData = await camionService.getInfosCamions();
        setCamions(camionsData);
      } catch {
        setApiError("Erreur lors du chargement des camions");
      }
    }
    fetchCamions();
  }, []);

  const fetchPanne = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setApiError(null);
    try {
      const panneData = await panneService.getById(id);
      reset({
        description: panneData.description,
        date_panne: panneData.date_panne?.split("T")[0] || "",
        statut: panneData.statut,
        camion: panneData.camion.id,
      });
    } catch (error: any) {
      setApiError(error.message || "Erreur lors du chargement de la panne");
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchPanne();
  }, [fetchPanne]);

  const onSubmit = async (data: PanneFormValues) => {
    setLoading(true);
    setApiError(null);

    try {
      if (id) {
        await panneService.update(id, data);
      } else {
        await panneService.create(data);
      }
      onSuccess();
    } catch (error: any) {
      setApiError(error.message || "Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6 font-sans"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {apiError && (
        <div className="text-red-600 font-semibold text-center">{apiError}</div>
      )}

      <div className="flex flex-col">
        <label htmlFor="description" className="mb-1 font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          {...register("description", { required: "Description est requise" })}
          placeholder="Ex: Problème moteur, bruit suspect, fumée noire..."
          aria-invalid={!!errors.description}
          className={`rounded border px-3 py-3 min-h-[120px] resize-y transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.description ? "border-red-600" : "border-gray-300"
          }`}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="date_panne" className="mb-1 font-medium text-gray-700">
          Date de panne
        </label>
        <Input
          label={""}
          id="date_panne"
          type="date"
          {...register("date_panne", {
            required: "La date de panne est requise",
          })}
          aria-invalid={!!errors.date_panne}
          aria-describedby="date_panne-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.date_panne ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.date_panne && (
          <p id="date_panne-error" className="text-red-600 text-sm mt-1">
            {errors.date_panne.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="statut" className="mb-1 font-medium text-gray-700">
          Statut
        </label>
        <select
          id="statut"
          {...register("statut", { required: "Le statut est requis" })}
          aria-invalid={!!errors.statut}
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
            errors.statut ? "border-red-600" : "border-gray-300"
          }`}
          disabled={isSubmitting}
          defaultValue=""
        >
          <option value="" disabled>
            Sélectionnez un statut
          </option>
          <option value="déclarée">Déclarée</option>
          <option value="en_cours">En cours</option>
          <option value="reparée">Réparée</option>
        </select>
        {errors.statut && (
          <p className="text-red-600 text-sm mt-1">{errors.statut.message}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="camion" className="mb-1 font-medium text-gray-700">
          Camion
        </label>
        <select
          id="camion"
          {...register("camion", { required: "Le camion est requis" })}
          aria-invalid={!!errors.camion}
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
            errors.camion ? "border-red-600" : "border-gray-300"
          }`}
          disabled={isSubmitting || camions.length === 0}
          defaultValue=""
        >
          <option value="" disabled>
            Sélectionnez un camion
          </option>
          {camions.map(({ id, immatriculation }) => (
            <option key={id} value={id}>
              {immatriculation}
            </option>
          ))}
        </select>
        {errors.camion && (
          <p className="text-red-600 text-sm mt-1">{errors.camion.message}</p>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-10 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 disabled:bg-gray-400 transition"
        >
          {id ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
}