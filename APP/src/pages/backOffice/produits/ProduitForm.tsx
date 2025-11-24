import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { produitService } from "../../../api/backOffice/produitService";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";

type ProduitFormValues = {
  nom: string;
  description: string;
  prix: number;
  actif: boolean;
  category: string;
};

export default function ProduitForm({
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
    formState: { errors },
  } = useForm<ProduitFormValues>({
    defaultValues: {
      nom: "",
      description: "",
      prix: 0,
      actif: false,
      category: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number; nom: string }[]>(
    []
  );

  // Charger catégories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoriesData = await produitService.getCategory();
        setCategories(categoriesData);
      } catch {
        setApiError("Erreur lors du chargement des catégories");
      }
    }
    fetchCategories();
  }, []);

  // Charger produit si édition
  const fetchProduit = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setApiError(null);

    try {
      const produitData = await produitService.getById(id);
      reset({
        nom: produitData.nom,
        description: produitData.description,
        prix: produitData.prix,
        actif: produitData.actif,
        category: produitData.category.id.toString(),
      });
    } catch (error: any) {
      setApiError(error.message || "Erreur lors du chargement du produit");
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchProduit();
  }, [fetchProduit]);

  const onSubmit = async (data: ProduitFormValues) => {
    setLoading(true);
    setApiError(null);

    try {
      if (id) {
        await produitService.update(id, data);
      } else {
        await produitService.create(data);
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

      {/* Nom */}
      <div className="flex flex-col">
        <label htmlFor="nom" className="mb-1 font-medium text-gray-700">
          Nom du produit
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

      {/* Description */}
      <div className="flex flex-col">
        <label htmlFor="description" className="mb-1 font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] ${
            errors.description ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Prix */}
      <div className="flex flex-col">
        <label htmlFor="prix" className="mb-1 font-medium text-gray-700">
          Prix (€)
        </label>
        <Input
          label={""}
          id="prix"
          type="number"
          step="0.01"
          {...register("prix", {
            required: "Le prix est requis",
            min: { value: 0, message: "Le prix doit être positif" },
          })}
          aria-invalid={!!errors.prix}
          aria-describedby="prix-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.prix ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.prix && (
          <p id="prix-error" className="text-red-600 text-sm mt-1">
            {errors.prix.message}
          </p>
        )}
      </div>

      {/* Actif */}
      <div className="flex items-center space-x-2">
        <input
          id="actif"
          type="checkbox"
          {...register("actif")}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          disabled={loading}
        />
        <label htmlFor="actif" className="font-medium text-gray-700">
          Actif
        </label>
      </div>

      {/* Catégorie */}
      <div className="flex flex-col">
        <label htmlFor="category" className="mb-1 font-medium text-gray-700">
          Catégorie
        </label>
        <select
          id="category"
          {...register("category", { required: "La catégorie est requise" })}
          aria-invalid={!!errors.category}
          aria-describedby="category-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
            errors.category ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading || categories.length === 0}
        >
          <option value="">Sélectionnez une catégorie</option>
          {categories.map(({ id, nom }) => (
            <option key={id} value={id}>
              {nom}
            </option>
          ))}
        </select>
        {errors.category && (
          <p id="category-error" className="text-red-600 text-sm mt-1">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Bouton */}
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