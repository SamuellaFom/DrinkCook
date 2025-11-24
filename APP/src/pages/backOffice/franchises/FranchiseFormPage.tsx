import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { franchiseService } from "../../../api/backOffice/franchiseService";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";

type FranchiseFormValues = {
  nom: string;
  adresse: string;
  siret: string;
  ville: string;
  code_postal: number;
  statut: string;
};

export default function FranchiseForm({
  id,
  onSuccess,
}: {
  id?: string;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FranchiseFormValues>();
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchFranchise = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setApiError(null);
    try {
      const data = await franchiseService.getById(id);
      reset(data);
    } catch (error: any) {
      setApiError(error.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchFranchise();
  }, [fetchFranchise]);

  const allowedFields = [
    "nom",
    "adresse",
    "siret",
    "ville",
    "code_postal",
    "statut",
  ];

  const onSubmit = async (data: FranchiseFormValues) => {
    setLoading(true);
    setApiError(null);
    const filteredData = allowedFields.reduce((acc, key) => {
      if (key in data) {
        // @ts-ignore
        acc[key] = data[key];
      }
      return acc;
    }, {} as Partial<FranchiseFormValues>);

    try {
      if (id) {
        await franchiseService.update(id, filteredData);
      } else {
        await franchiseService.create(filteredData);
      }
      onSuccess();
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6 font-sans"
      onSubmit={handleSubmit(onSubmit)}
    >
      {apiError && (
        <div className="text-red-600 font-semibold text-center">{apiError}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label htmlFor="nom" className="mb-1 font-medium text-gray-700">
            Nom
          </label>
          <Input
            label={""}
            id="nom"
            {...register("nom", { required: "Le nom est requis" })}
            defaultValue=""
            aria-invalid={!!errors.nom}
            aria-describedby="nom-error"
            className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.nom ? "border-red-600" : "border-gray-300"
            }`}
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
            defaultValue=""
            aria-invalid={!!errors.adresse}
            aria-describedby="adresse-error"
            className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.adresse ? "border-red-600" : "border-gray-300"
            }`}
          />
          {errors.adresse && (
            <p id="adresse-error" className="text-red-600 text-sm mt-1">
              {errors.adresse.message}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="siret" className="mb-1 font-medium text-gray-700">
            SIRET
          </label>
          <Input
            label={""}
            id="siret"
            {...register("siret", { required: "Le SIRET est requis" })}
            defaultValue=""
            aria-invalid={!!errors.siret}
            aria-describedby="siret-error"
            className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.siret ? "border-red-600" : "border-gray-300"
            }`}
          />
          {errors.siret && (
            <p id="siret-error" className="text-red-600 text-sm mt-1">
              {errors.siret.message}
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
            defaultValue=""
            aria-invalid={!!errors.ville}
            aria-describedby="ville-error"
            className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.ville ? "border-red-600" : "border-gray-300"
            }`}
          />
          {errors.ville && (
            <p id="ville-error" className="text-red-600 text-sm mt-1">
              {errors.ville.message}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="code_postal"
            className="mb-1 font-medium text-gray-700"
          >
            Code postal
          </label>
          <Input
            label={""}
            id="code_postal"
            {...register("code_postal", {
              required: "Le code postal est requis",
            })}
            defaultValue=""
            aria-invalid={!!errors.code_postal}
            aria-describedby="code_postal-error"
            className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.code_postal ? "border-red-600" : "border-gray-300"
            }`}
          />
          {errors.code_postal && (
            <p id="code_postal-error" className="text-red-600 text-sm mt-1">
              {errors.code_postal.message}
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="en_attente">En attente</option>
          </select>
          {errors.statut && (
            <p id="statut-error" className="text-red-600 text-sm mt-1">
              {errors.statut.message}
            </p>
          )}
        </div>
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