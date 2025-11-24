import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { camionService } from "../../../api/backOffice/camionService";
import { franchiseService } from "../../../api/backOffice/franchiseService";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";

type CamionFormValues = {
  immatriculation: string;
  date_achat: string;
  kilometrage: number;
  statut: string;
  franchise: string;
};

export default function CamionForm({
  id,
  onSuccess,
}: {
  id?: number;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CamionFormValues>({
    defaultValues: {
      immatriculation: "",
      date_achat: "",
      kilometrage: 0,
      statut: "",
      franchise: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [franchises, setFranchises] = useState<{ id: string; nom: string }[]>(
    []
  );

  useEffect(() => {
    async function fetchFranchises() {
      try {
        const franchisesData = await franchiseService.getInfos();
        setFranchises(franchisesData);
      } catch {
        setApiError("Erreur lors du chargement des franchises");
      }
    }
    fetchFranchises();
  }, []);

  const fetchCamion = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setApiError(null);

    try {
      const camionData = await camionService.getById(id);
      reset({
        immatriculation: camionData.immatriculation,
        date_achat: camionData.date_achat?.split("T")[0] || "",
        kilometrage: camionData.kilometrage,
        statut: camionData.statut,
        franchise: camionData.franchise?.id || "",
      });
    } catch (error: any) {
      setApiError(error.message || "Erreur lors du chargement du camion");
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchCamion();
  }, [fetchCamion]);

  const onSubmit = async (data: CamionFormValues) => {
    setLoading(true);
    setApiError(null);

    try {
      if (id) {
        await camionService.update(id, data);
      } else {
        await camionService.create(data);
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
        <label
          htmlFor="immatriculation"
          className="mb-1 font-medium text-gray-700"
        >
          Immatriculation
        </label>
        <Input
          label={""}
          id="immatriculation"
          {...register("immatriculation", {
            required: "L'immatriculation est requise",
          })}
          aria-invalid={!!errors.immatriculation}
          aria-describedby="immatriculation-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.immatriculation ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.immatriculation && (
          <p id="immatriculation-error" className="text-red-600 text-sm mt-1">
            {errors.immatriculation.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="date_achat" className="mb-1 font-medium text-gray-700">
          Date d'achat
        </label>
        <Input
          label={""}
          id="date_achat"
          type="date"
          {...register("date_achat", {
            required: "La date d'achat est requise",
          })}
          aria-invalid={!!errors.date_achat}
          aria-describedby="date_achat-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.date_achat ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.date_achat && (
          <p id="date_achat-error" className="text-red-600 text-sm mt-1">
            {errors.date_achat.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="kilometrage" className="mb-1 font-medium text-gray-700">
          Kilométrage
        </label>
        <Input
          label={""}
          id="kilometrage"
          type="number"
          {...register("kilometrage", {
            required: "Le kilométrage est requis",
            min: { value: 0, message: "Le kilométrage doit être positif" },
          })}
          aria-invalid={!!errors.kilometrage}
          aria-describedby="kilometrage-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.kilometrage ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.kilometrage && (
          <p id="kilometrage-error" className="text-red-600 text-sm mt-1">
            {errors.kilometrage.message}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:col-span-2">
        <label htmlFor="statut" className="mb-1 font-medium text-gray-700">
          Statut
        </label>
        <select
          id="statut"
          {...register("statut", { required: "Le statut est requis" })}
          aria-invalid={!!errors.statut}
          aria-describedby="statut-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
            errors.statut ? "border-red-600" : "border-gray-300"
          }`}
          defaultValue=""
        >
          <option value="" disabled>
            Sélectionnez un statut
          </option>
          <option value="disponible">Disponible</option>
          <option value="en_reparation">En reparation</option>
          <option value="en_mission">En mission</option>
          <option value="hors_service">Hors service</option>
        </select>
        {errors.statut && (
          <p id="statut-error" className="text-red-600 text-sm mt-1">
            {errors.statut.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="franchise" className="mb-1 font-medium text-gray-700">
          Franchise
        </label>
        <select
          id="franchise"
          {...register("franchise", { required: "La franchise est requise" })}
          aria-invalid={!!errors.franchise}
          aria-describedby="franchise-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
            errors.franchise ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading || franchises.length === 0}
          defaultValue=""
        >
          <option value="" disabled>
            Sélectionnez une franchise
          </option>
          {franchises.map(({ id, nom }) => (
            <option key={id} value={id}>
              {nom}
            </option>
          ))}
        </select>
        {errors.franchise && (
          <p id="franchise-error" className="text-red-600 text-sm mt-1">
            {errors.franchise.message}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={loading}
          className="px-10 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 disabled:bg-gray-400 transition"
        >
          {id ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
}