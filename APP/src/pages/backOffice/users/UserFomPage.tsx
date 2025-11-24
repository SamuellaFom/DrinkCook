import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { userService } from "../../../api/backOffice/userService";
import { franchiseService } from "../../../api/backOffice/franchiseService";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";

type UserFormValues = {
  username: string;
  email: string;
  role: string;
  franchise: string;
};

export default function UserForm({
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
  } = useForm<UserFormValues>({
    defaultValues: {
      username: "",
      email: "",
      role: "",
      franchise: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ id: string; type: string }[]>([]);
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

    async function fetchRoles() {
      try {
        const rolesData = await userService.getInfosRole();
        setRoles(rolesData);
      } catch {
        setApiError("Erreur lors du chargement des rôles");
      }
    }
    fetchRoles();
  }, []);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setApiError(null);
    try {
      const userData = await userService.getById(id);
      reset({
        username: userData.username,
        email: userData.email,
        role: userData.role.type,
        franchise: userData.franchise.id,
      });
    } catch (error: any) {
      setApiError(
        error.message || "Erreur lors du chargement de l'utilisateur"
      );
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    setApiError(null);

    const payload = { ...data };

    try {
      if (id) {
        await userService.update(id, payload);
      } else {
        await userService.create(payload);
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
        <label htmlFor="username" className="mb-1 font-medium text-gray-700">
          Nom d'utilisateur
        </label>
        <Input
          label={""}
          id="username"
          {...register("username", {
            required: "Le nom d'utilisateur est requis",
          })}
          aria-invalid={!!errors.username}
          aria-describedby="username-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.username ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.username && (
          <p id="username-error" className="text-red-600 text-sm mt-1">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="email" className="mb-1 font-medium text-gray-700">
          Email
        </label>
        <Input
          label={""}
          type="email"
          id="email"
          {...register("email", {
            required: "L'email est requis",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Email invalide",
            },
          })}
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.email ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.email && (
          <p id="email-error" className="text-red-600 text-sm mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="role" className="mb-1 font-medium text-gray-700">
          Rôle
        </label>
        <select
          id="role"
          {...register("role", { required: "Le rôle est requis" })}
          aria-invalid={!!errors.role}
          aria-describedby="role-error"
          className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
            errors.role ? "border-red-600" : "border-gray-300"
          }`}
          disabled={loading || roles.length === 0}
          defaultValue=""
        >
          <option value="" disabled>
            Sélectionnez un rôle
          </option>
          {roles.map(({ id, type }) => (
            <option key={id} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.role && (
          <p id="role-error" className="text-red-600 text-sm mt-1">
            {errors.role.message}
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