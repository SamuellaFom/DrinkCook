import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import {evenementService} from "../../../api/frontOffice/evenementService";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";


type FormValues = {

    titre: string;
    description?: string | null;
    dateDebut: string;
    dateFin?: string | null;
    notifyClients: boolean;
};

const toDatetimeLocal = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
};

const toISO = (local?: string | null) => (local ? new Date(local).toISOString() : null);

export default function EvenementFormPage({
                                              id,
                                              onSuccess,
                                          }: { id?: string; onSuccess: () => void }) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormValues>({ defaultValues: { titre: "", description: "", dateDebut: "", dateFin: "", notifyClients: false } });
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const fetchEvenement = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setApiError(null);
        try {
            const ev = await evenementService.getById(id);
            reset({
                titre: ev.titre ?? "",
                description: ev.description ?? "",
                dateDebut: toDatetimeLocal(ev.dateDebut),
                dateFin: toDatetimeLocal(ev.dateFin ?? null),
            });
        } catch (e: any) {
            setApiError(e?.message ?? "Erreur lors du chargement de l'événement");
        } finally {
            setLoading(false);
        }
    }, [id, reset]);

    useEffect(() => { fetchEvenement(); }, [fetchEvenement]);

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        setApiError(null);
        try {
            const payload = {
                titre: data.titre,
                description: data.description?.trim() || null,
                dateDebut: toISO(data.dateDebut)!,
                dateFin: toISO(data.dateFin || null),
            };

            if (payload.dateFin && new Date(payload.dateFin) < new Date(payload.dateDebut)) {
                setApiError("La date de fin ne peut pas être antérieure à la date de début.");
                setLoading(false);
                return;
            }

            if (id) {
                await evenementService.update(id, payload);
            } else {
                await evenementService.create({
                    ...payload,
                    notifyClients: !!data.notifyClients,
                });
            }

            onSuccess();
        } catch (e: any) {
            setApiError(e?.message ?? "Erreur lors de l’enregistrement");
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
            {apiError && <div className="text-red-600 font-semibold text-center">{apiError}</div>}

            <div className="flex flex-col">
                <label htmlFor="titre" className="mb-1 font-medium text-gray-700">Titre</label>
                <Input
                    id="titre" label=""
                    {...register("titre", { required: "Le titre est requis", minLength: { value: 2, message: "2 caractères minimum" } })}
                    aria-invalid={!!errors.titre}
                    className={`rounded border px-3 py-2 ${errors.titre ? "border-red-600" : "border-gray-300"}`}
                    disabled={loading || isSubmitting}
                />
                {errors.titre && <p className="text-red-600 text-sm mt-1">{errors.titre.message}</p>}
            </div>

            <div className="flex flex-col">
                <label htmlFor="description" className="mb-1 font-medium text-gray-700">Description (optionnelle)</label>
                <textarea
                    id="description" rows={4}
                    {...register("description")}
                    className="rounded border px-3 py-2 border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    disabled={loading || isSubmitting}
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="dateDebut" className="mb-1 font-medium text-gray-700">Date de début</label>
                <Input
                    id="dateDebut" label=""
                    type="datetime-local"
                    {...register("dateDebut", { required: "La date de début est requise" })}
                    aria-invalid={!!errors.dateDebut}
                    className={`rounded border px-3 py-2 ${errors.dateDebut ? "border-red-600" : "border-gray-300"}`}
                    disabled={loading || isSubmitting}
                />
                {errors.dateDebut && <p className="text-red-600 text-sm mt-1">{errors.dateDebut.message}</p>}
            </div>

            <div className="flex flex-col">
                <label htmlFor="dateFin" className="mb-1 font-medium text-gray-700">Date de fin (optionnelle)</label>
                <Input
                    id="dateFin" label=""
                    type="datetime-local"
                    {...register("dateFin")}
                    aria-invalid={!!errors.dateFin}
                    className={`rounded border px-3 py-2 ${errors.dateFin ? "border-red-600" : "border-gray-300"}`}
                    disabled={loading || isSubmitting}
                />
            </div>

            {!id && (
                <div className="flex items-center gap-3">
                    <input
                        id="notifyClients"
                        type="checkbox"
                        {...register("notifyClients")}
                        disabled={loading || isSubmitting}
                    />
                    <label htmlFor="notifyClients" className="text-sm text-gray-700">
                        Envoyer cet évènement par email à tous mes clients
                    </label>
                </div>
            )}



            <div className="flex justify-center">
                <Button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="px-10 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 disabled:bg-gray-400 transition"
                >
                    {id ? "Mettre à jour" : "Créer"}
                </Button>
            </div>
        </form>
    );
}
