import React, { useEffect, useMemo, useState } from "react";
import {Camion} from "../../../assets/ts/interfaces";
import {camionFranchiseService} from "../../../api/frontOffice/camionFranchise-service";


type PanneForm = {
    date_panne: string;
    description: string;
};

const initialForm: PanneForm = {
    date_panne: "",
    description: "",
};

const formatDate = (iso?: string | Date | null) => {
    if (!iso) return "-";
    const d = typeof iso === "string" ? new Date(iso) : iso;
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
};

const formatDatetimeLocal = (d = new Date()) => {
    const pad = (n: number) => `${n}`.padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
};

const toISOFromDatetimeLocal = (val: string) => {
    if (!val) return "";
    const [datePart, timePart] = val.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm] = timePart.split(":").map(Number);
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
    return dt.toISOString();
};

export default function MonCamionPage() {
    const [loading, setLoading] = useState(true);
    const [camion, setCamion] = useState<Camion | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<PanneForm>({
        ...initialForm,
        date_panne: formatDatetimeLocal(new Date()),
    });
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const hasTruck = useMemo(() => !!camion, [camion]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const data = await camionFranchiseService.getMine();
            setCamion(data);
        } catch (e: any) {
            setError(e?.message || "Une erreur est survenue.");
            setCamion(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!camion?.id) return;

        setSubmitting(true);
        setSuccessMsg(null);
        setError(null);
        try {
            await camionFranchiseService.declarePanne(camion.id as unknown as number, {
                date_panne: toISOFromDatetimeLocal(form.date_panne),
                description: form.description?.trim(),
            });
            setSuccessMsg("Panne déclarée avec succès");
            setForm({
                date_panne: formatDatetimeLocal(new Date()),
                description: "",
            });
        } catch (e: any) {
            setError(e?.message || "Impossible de déclarer la panne.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Mon camion</h1>

            </div>

            {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error === "NO_TRUCK_FOR_FRANCHISE"
                        ? "Aucun camion rattaché à votre franchise."
                        : error}
                </div>
            )}

            {successMsg && (
                <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    {successMsg}
                </div>
            )}

            {!loading && !hasTruck && (
                <div className="rounded-lg border p-5">
                    <p className="text-gray-700">
                        Aucun camion n’est actuellement associé à votre franchise.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Contactez l’administrateur pour rattacher un camion à votre compte.
                    </p>
                </div>
            )}

            {!loading && hasTruck && camion && (
                <>
                    {}
                    <div className="rounded-lg border p-5 mb-8">
                        <h2 className="text-lg font-medium mb-4">Informations</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 text-center">
                            <div>
                                <dt className="text-sm text-gray-500">Immatriculation</dt>
                                <dd className="font-medium">{camion.immatriculation || "-"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Date d’achat</dt>
                                <dd className="font-medium">{formatDate(camion.date_achat)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Kilométrage</dt>
                                <dd className="font-medium">
                                    {camion.kilometrage != null ? `${camion.kilometrage} km` : "-"}
                                </dd>
                            </div>
                        </dl>

                    </div>

                    {}
                    <div className="rounded-lg border p-5">
                        <h2 className="text-lg font-medium mb-4">Déclarer une panne</h2>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="date_panne" className="block text-sm text-gray-600 mb-1">
                                    Date et heure
                                </label>
                                <input
                                    id="date_panne"
                                    name="date_panne"
                                    type="datetime-local"
                                    value={form.date_panne}
                                    onChange={onChange}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm text-gray-600 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={form.description}
                                    onChange={onChange}
                                    placeholder="Décrivez brièvement la panne…"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? "Envoi…" : "Déclarer la panne"}
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                                    onClick={() => setForm({ ...initialForm, date_panne: formatDatetimeLocal(new Date()) })}
                                    disabled={submitting}
                                >
                                    Réinitialiser
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
