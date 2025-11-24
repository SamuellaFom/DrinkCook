import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";
import { menuService } from "../../../api/frontOffice/menuService";
import { articlePrixFranchiseService } from "../../../api/frontOffice/articlePrixFranchiseService";

type MenuFormValues = {
    nom: string;
    description?: string | null;
    prix: number;
    actif?: boolean;
    lignes: { produitId: string; quantite: number }[];
};

type ProductOption = { id: string; nom: string };

export default function MenuFormDrawer({
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
    } = useForm<MenuFormValues>({
        defaultValues: {
            nom: "",
            description: "",
            prix: 0,
            actif: true,
            lignes: [],
        },
    });

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const [lignes, setLignes] = useState<{ produitId: string; quantite: number }[]>(
        []
    );

    const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const loadProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            const articles = await articlePrixFranchiseService.list({
                inStockOnly: true,
                actifsOnly: true,
            });
            setProductOptions(articles.map((a) => ({ id: a.id, nom: a.nom })));
        } catch (e) {
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    const loadMenu = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setApiError(null);
        try {
            const m = await menuService.getById(id);
            reset({
                nom: m.nom,
                description: m.description ?? "",
                prix: Number(m.prix),
                actif: !!m.actif,
                lignes:
                    m.lignes?.map((l: any) => ({
                        produitId: l.produitId,
                        quantite: Number(l.quantite),
                    })) ?? [],
            });
            const lgs =
                m.lignes?.map((l: any) => ({
                    produitId: l.produitId ?? l.produit?.id,
                    quantite: Number(l.quantite),
                })) ?? [];
            setLignes(lgs);

            setProductOptions((opts) => {
                const setIds = new Set(opts.map((o) => o.id));
                const extras: ProductOption[] = [];
                for (const lg of lgs) {
                    if (lg.produitId && !setIds.has(lg.produitId)) {
                        extras.push({ id: lg.produitId, nom: lg.produitId });
                    }
                }
                return extras.length ? [...opts, ...extras] : opts;
            });
        } catch (e: any) {
            setApiError(e?.message ?? "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    }, [id, reset]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        loadMenu();
    }, [loadMenu]);

    const addLigne = () =>
        setLignes((prev) => [...prev, { produitId: "", quantite: 1 }]);
    const removeLigne = (index: number) =>
        setLignes((prev) => prev.filter((_, i) => i !== index));
    const updateLigne = (
        index: number,
        patch: Partial<{ produitId: string; quantite: number }>
    ) => setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));

    const onSubmit = async (form: MenuFormValues) => {
        setLoading(true);
        setApiError(null);

        const lignesNettoyees = lignes.filter((l) => l.produitId && l.quantite > 0);
        if (lignesNettoyees.length === 0) {
            setApiError("Ajoutez au moins une ligne avec un produit.");
            setLoading(false);
            return;
        }

        const payload = {
            nom: form.nom,
            description: form.description ?? "",
            prix: Number(form.prix),
            actif: !!form.actif,
            lignes: lignesNettoyees.map((l) => ({
                produitId: l.produitId,
                quantite: Number(l.quantite),
            })),
        };

        try {
            if (id) {
                await menuService.update(id, payload);
            } else {
                await menuService.create(payload);
            }
            onSuccess();
        } catch (e: any) {
            setApiError(e?.message ?? "Erreur lors de l’enregistrement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {apiError && <div className="text-red-600">{apiError}</div>}

            <div>
                <label className="block text-sm mb-1 text-gray-700">Nom</label>
                <Input
                    label=""
                    {...register("nom", { required: "Nom requis" })}
                    aria-invalid={!!errors.nom}
                    className={`w-full ${errors.nom ? "border-red-600" : ""}`}
                    disabled={loading}
                />
                {errors.nom && (
                    <p className="text-red-600 text-sm mt-1">{errors.nom.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm mb-1 text-gray-700">Description</label>
                <Input label="" {...register("description")} disabled={loading} />
            </div>

            <div>
                <label className="block text-sm mb-1 text-gray-700">Prix (€)</label>
                <Input
                    label=""
                    type="number"
                    step="0.01"
                    {...register("prix", {
                        required: "Prix requis",
                        min: { value: 0, message: "Min 0" },
                    })}
                    aria-invalid={!!errors.prix}
                    className={`w-48 ${errors.prix ? "border-red-600" : ""}`}
                    disabled={loading}
                />
                {errors.prix && (
                    <p className="text-red-600 text-sm mt-1">{errors.prix.message}</p>
                )}
            </div>

            <label className="flex items-center gap-2">
                <input type="checkbox" {...register("actif")} disabled={loading} />
                Actif
            </label>

            {}
            <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Lignes (produits inclus)</h3>
                    <Button
                        type="button"
                        className="bg-gray-800 text-white px-3 py-1 rounded"
                        onClick={addLigne}
                        disabled={loading}
                    >
                        + Ajouter une ligne
                    </Button>
                </div>

                {lignes.length === 0 && (
                    <div className="text-gray-500">Aucune ligne</div>
                )}

                <div className="space-y-2">
                    {lignes.map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                            {}
                            <select
                                value={l.produitId}
                                onChange={(e) => updateLigne(i, { produitId: e.target.value })}
                                className="flex-1 border rounded px-2 py-1"
                                disabled={loading || loadingProducts}
                            >
                                <option value="">— Choisir un produit —</option>
                                {productOptions.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nom}
                                    </option>
                                ))}
                            </select>

                            {}
                            <Input
                                label=""
                                type="number"
                                min={1}
                                value={l.quantite}
                                onChange={(e: any) =>
                                    updateLigne(i, { quantite: Number(e.target.value) })
                                }
                                className="w-28"
                                disabled={loading}
                            />

                            <Button
                                type="button"
                                className="bg-red-600 text-white px-3 py-1 rounded"
                                onClick={() => removeLigne(i)}
                                disabled={loading}
                            >
                                Supprimer
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-2">
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                    {id ? "Mettre à jour" : "Créer"}
                </Button>
            </div>
        </form>
    );
}
