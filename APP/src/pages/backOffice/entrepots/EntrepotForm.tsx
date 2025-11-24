import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { entrepotService } from "../../../api/backOffice/entrepotService";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";

type EntrepotFormValues = {
  nom: string;
  adresse: string;
  ville: string;
  code_postal: string;
};

export default function EntrepotForm({
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
  } = useForm<EntrepotFormValues>({
    defaultValues: {
      nom: "",
      adresse: "",
      ville: "",
      code_postal: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchEntrepot = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setApiError(null);

    try {
      const entrepotData = await entrepotService.getById(id);
      reset({
        nom: entrepotData.nom,
        adresse: entrepotData.adresse,
        ville: entrepotData.ville,
        code_postal: entrepotData.code_postal,
      });
    } catch (error: any) {
      setApiError(error.message || "Erreur lors du chargement de l'entrepôt");
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchEntrepot();
  }, [fetchEntrepot]);

  const onSubmit = async (data: EntrepotFormValues) => {
    setLoading(true);
    setApiError(null);

    try {
      if (id) {
        await entrepotService.update(id, data);
      } else {
        await entrepotService.create(data);
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
        <label htmlFor="nom" className="mb-1 font-medium text-gray-700">
          Nom
        </label>
        <Input
          label={""}
          id="nom"
          {...register("nom", { required: "Le nom est requis" })}
          aria-invalid={!!errors.nom}
          aria-describedby="nom-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.nom ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.nom && (
          <p id="nom-error" className="text-red-600 text-sm mt-1">
            {errors.nom.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="adresse" className="mb-1 font-medium text-gray-700">
          Adresse
        </label>
        <Input
          label={""}
          id="adresse"
          {...register("adresse", { required: "L'adresse est requise" })}
          aria-invalid={!!errors.adresse}
          aria-describedby="adresse-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.adresse ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.adresse && (
          <p id="adresse-error" className="text-red-600 text-sm mt-1">
            {errors.adresse.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="ville" className="mb-1 font-medium text-gray-700">
          Ville
        </label>
        <Input
          label={""}
          id="ville"
          {...register("ville", { required: "La ville est requise" })}
          aria-invalid={!!errors.ville}
          aria-describedby="ville-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.ville ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.ville && (
          <p id="ville-error" className="text-red-600 text-sm mt-1">
            {errors.ville.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="code_postal" className="mb-1 font-medium text-gray-700">
          Code postal
        </label>
        <Input
          label={""}
          id="code_postal"
          {...register("code_postal", {
            required: "Le code postal est requis",
            pattern: {
              value: /^[0-9]{5}$/,
              message: "Le code postal doit contenir 5 chiffres",
            },
          })}
          aria-invalid={!!errors.code_postal}
          aria-describedby="code_postal-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.code_postal ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.code_postal && (
          <p id="code_postal-error" className="text-red-600 text-sm mt-1">
            {errors.code_postal.message}
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