import {useEffect, useState, useCallback} from "react";
import {useForm} from "react-hook-form";
import {clientService} from "../../../api/frontOffice/clientService";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";


type ClientFormValues = {
    nom: string;
    email: string;
    telephone?: string | null;
};

export default function ClientForm({
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
        formState: {errors},
    } = useForm<ClientFormValues>({
        defaultValues: {
            nom: "",
            email: "",
            telephone: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [roles, setRoles] = useState<{ id: string; type: string }[]>([]);
    const [franchises, setFranchises] = useState<{ id: string; nom: string }[]>(
        []
    );

    const fetchClient = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setApiError(null);
        try {
            const clientData = await clientService.getById(id);
            reset({
                nom: clientData.nom,
                email: clientData.email,
                telephone: clientData.telephone,
            });
        } catch (error: any) {
            setApiError(
                error.message || "Erreur lors du chargement du client"
            );
        } finally {
            setLoading(false);
        }
    }, [id, reset]);

    useEffect(() => {
        fetchClient();
    }, [fetchClient]);

    const onSubmit = async (data: ClientFormValues) => {
        setLoading(true);
        setApiError(null);

        const payload = {...data};


        try {
            if (id) {
                await clientService.update(id, payload);
            } else {
                await clientService.create(payload);
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
                    {...register("nom", {
                        required: "Le nom du client est requis",
                    })}
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
                <label htmlFor="telephone" className="mb-1 font-medium text-gray-700">
                    Telephone
                </label>
                <Input
                label={""}
                id="telephone"
                {...register("telephone", {
                pattern: {
                    value: /^[0-9 +().-]{6,20}$/,
                    message: "Numéro invalide",
                },
                })}
                aria-invalid={!!errors.telephone}
                aria-describedby="telephone-error"
                className={`rounded border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.telephone ? "border-red-600" : "border-gray-300"
            }`}
                disabled={loading}
                />
                {errors.telephone && (
                    <p id="telephone-error" className="text-red-600 text-sm mt-1">
                        {errors.telephone.message}
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





