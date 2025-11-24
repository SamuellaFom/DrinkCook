import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { entretienService } from "../../../api/backOffice/entretienService";
import { camionService } from "../../../api/backOffice/camionService";
import Input from "../../basics/Input";
import Button from "../../basics/Button";

type EntretienFormValues = {
  description: string;
  date_revision: string;
  kilometrage: number;
  realisé_par: string;
  camion: string;
};

export default function EntretienForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EntretienFormValues>({
    defaultValues: {
      description: "",
      date_revision: "",
      kilometrage: 0,
      realisé_par: "",
      camion: "",
    },
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  const onSubmit = async (data: EntretienFormValues) => {
    setApiError(null);
    setSuccess(null);

    try {
      await entretienService.create(data);
      setSuccess("Entretien ajouté avec succès !");
      reset();
      onSuccess();
    } catch (error: any) {
      setApiError(error.message || "Erreur lors de la soumission");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6 font-sans"
      noValidate
    >
      {apiError && (
        <div className="text-red-600 font-semibold text-center">{apiError}</div>
      )}
      {success && (
        <div className="text-green-600 font-semibold text-center">
          {success}
        </div>
      )}

      <div>
        <label
          htmlFor="description"
          className="block mb-1 font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          {...register("description", {
            required: "La description est requise",
          })}
          placeholder="Ex: Vidange moteur, remplacement des freins..."
          className={`w-full border px-3 py-3 rounded-lg focus:ring-2 min-h-[120px] resize-y ${
            errors.description
              ? "border-red-600 focus:ring-red-500"
              : "border-gray-300 focus:ring-indigo-500"
          }`}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="date_revision"
          className="block mb-1 font-medium text-gray-700"
        >
          Date de révision
        </label>
        <Input
          label={""}
          id="date_revision"
          type="date"
          {...register("date_revision", { required: "La date est requise" })}
          className={`w-full border px-3 py-2 rounded-lg focus:ring-2 ${
            errors.date_revision
              ? "border-red-600 focus:ring-red-500"
              : "border-gray-300 focus:ring-indigo-500"
          }`}
          disabled={isSubmitting}
        />
        {errors.date_revision && (
          <p className="text-red-600 text-sm mt-1">
            {errors.date_revision.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="kilometrage"
          className="block mb-1 font-medium text-gray-700"
        >
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
          placeholder="Ex: 120000"
          className={`w-full border px-3 py-2 rounded-lg focus:ring-2 ${
            errors.kilometrage
              ? "border-red-600 focus:ring-red-500"
              : "border-gray-300 focus:ring-indigo-500"
          }`}
          disabled={isSubmitting}
        />
        {errors.kilometrage && (
          <p className="text-red-600 text-sm mt-1">
            {errors.kilometrage.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="realisé_par"
          className="block mb-1 font-medium text-gray-700"
        >
          Réalisé par
        </label>
        <Input
          label={""}
          id="realisé_par"
          {...register("realisé_par", { required: "Le nom est requis" })}
          placeholder="Ex: Garage Renault"
          className={`w-full border px-3 py-2 rounded-lg focus:ring-2 ${
            errors.realisé_par
              ? "border-red-600 focus:ring-red-500"
              : "border-gray-300 focus:ring-indigo-500"
          }`}
          disabled={isSubmitting}
        />
        {errors.realisé_par && (
          <p className="text-red-600 text-sm mt-1">
            {errors.realisé_par.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="camion"
          className="block mb-1 font-medium text-gray-700"
        >
          Camion
        </label>
        <select
          id="camion"
          {...register("camion", { required: "Le camion est requis" })}
          className={`w-full border px-3 py-2 rounded-lg focus:ring-2 bg-white ${
            errors.camion
              ? "border-red-600 focus:ring-red-500"
              : "border-gray-300 focus:ring-indigo-500"
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
          {isSubmitting ? "En cours..." : "Créer"}
        </Button>
      </div>
    </form>
  );
}