import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import {CommandeStock, StatutCommandeStock} from "../../../assets/ts/FranchiseInterface";
import {commandeStockService} from "../../../api/frontOffice/commandeStockService";
import {CataloguePanel} from "../../../components/frontOffice/commandesStocks/CataloguePanel";
import Input from "../../../components/basics/Input";
import Button from "../../../components/basics/Button";
import {Produit} from "../../../assets/ts/interfaces";
import {EntrepotLite, entrepotService} from "../../../api/frontOffice/entrepotService";

type FormValues = {
    entrepotId: number | "";
    lignes: { produitId: string; quantite: number }[];
};

export default function CommandeStockFormPage({
                                                  id,
                                                  onSuccess,
                                              }: {
    id?: number;
    onSuccess: () => void;
}) {
    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { isSubmitting },
    } = useForm<FormValues>({ defaultValues: { entrepotId: "", lignes: [] } });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "lignes",
    });

    const lignesValues = useWatch({ control, name: "lignes" });

    const [entrepots, setEntrepots] = useState<EntrepotLite[]>([]);
    const [picked, setPicked] = useState<Record<string, Produit>>({});
    const [editingLocked, setEditingLocked] = useState(false);
    const [loadingInit, setLoadingInit] = useState(false);
    const [statut, setStatut] = useState<StatutCommandeStock | undefined>(
        undefined
    );

    const fmt = (n: number) =>
        n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });





    const [quotaPreview, setQuotaPreview] = useState<{
        directLivre: number;
        totalLivre: number;
        resteDirectAutorise: number;
    } | null>(null);
    const [loadingQuota, setLoadingQuota] = useState(false);
    const [quotaErr, setQuotaErr] = useState<string | null>(null);

    const watchEntrepotId = useWatch({ control, name: "entrepotId" });

    useEffect(() => {
        const isDirect = (typeof (watchEntrepotId) === "string" && watchEntrepotId === "")
            || (watchEntrepotId as any) === "";
        if (!isDirect) { setQuotaPreview(null); return; }

        (async () => {
            try {
                setLoadingQuota(true);
                setQuotaErr(null);
                const data = await commandeStockService.previewQuota8020();
                setQuotaPreview(data);
            } catch (e: any) {
                setQuotaErr(e?.message ?? "Erreur quota 80/20");
                setQuotaPreview(null);
            } finally {
                setLoadingQuota(false);
            }
        })();
    }, []);





    const total = useMemo(() => {
        return (lignesValues ?? []).reduce((sum, l) => {
            const p = picked[l.produitId];
            const price = p ? Number(p.prix ?? 0) : 0;
            const qty = Number(l?.quantite ?? 0);
            return sum + price * qty;
        }, 0);
    }, [lignesValues, picked]);

    useEffect(() => {
        entrepotService
            .list()
            .then(setEntrepots)
            .catch(() => setEntrepots([]));
    }, []);

    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                setLoadingInit(true);
                const cmd: CommandeStock = await commandeStockService.getById(id);

                setStatut(cmd.statut);
                setEditingLocked(cmd.statut !== StatutCommandeStock.EN_COURS);

                const lignes = (cmd.produits ?? []).map((l) => ({
                    produitId: l.produit?.id as string,
                    quantite: Number(l.quantite),
                }));

                reset({
                    entrepotId: cmd.entrepot?.id ?? "",
                    lignes,
                });

                const dict: Record<string, Produit> = {};
                (cmd.produits ?? []).forEach((l) => {
                    if (l.produit?.id) {
                        dict[l.produit.id] = {
                            id: l.produit.id,
                            nom: l.produit.nom ?? l.produit.id,
                            prix: Number(l.prix_unitaire ?? 0),
                            description: "",
                            actif: true,
                            category: undefined as any,
                        } as unknown as Produit;
                    }
                });
                setPicked(dict);
            } finally {
                setLoadingInit(false);
            }
        })();
    }, [id, reset]);

    const addProduct = useCallback(
        (p: Produit) => {
            if (editingLocked) return;
            const idx = fields.findIndex((f) => f.produitId === p.id);
            if (idx >= 0)
                update(idx, {
                    ...fields[idx],
                    quantite: Number(fields[idx].quantite) + 1,
                });
            else append({ produitId: p.id, quantite: 1 });
            setPicked((prev) => ({ ...prev, [p.id]: p }));
        },
        [append, fields, update, editingLocked]
    );

    const onSubmit = async (data: FormValues) => {
        if (editingLocked) return;

        try {
            const payload = {
                entrepotId: data.entrepotId === "" ? null : Number(data.entrepotId),
                lignes: data.lignes.map((l) => ({
                    produitId: l.produitId,
                    quantite: Number(l.quantite),
                })),
            };

            if (id) await commandeStockService.update(id, payload);
            else await commandeStockService.create(payload);

            onSuccess();
        } catch (e: any) {
            alert(e?.message ?? "Erreur lors de l’enregistrement");
        }
    };

    const canSubmit = !!id && statut === StatutCommandeStock.EN_COURS;
    const canReceive = !!id && statut === StatutCommandeStock.VALIDE;
    const canDelete = !!id && statut === StatutCommandeStock.EN_COURS;

    const handleSubmitWorkflow = async () => {
        if (!id) return;
        await commandeStockService.submit(id);
        onSuccess();
    };
    const handleReceiveWorkflow = async () => {
        if (!id) return;
        await commandeStockService.receive(id);
        onSuccess();
    };
    const handleDeleteDraft = async () => {
        if (!id) return;
        if (window.confirm("Supprimer ce brouillon ?")) {
            await commandeStockService.remove(id);
            onSuccess();
        }
    };

    if (loadingInit) {
        return <div className="p-4 text-gray-600">Chargement…</div>;
    }

    return (
        <form
            className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            {}
            {statut && (
                <div className="flex justify-end">
          <span
              className={
                  "px-2 py-1 rounded text-xs font-semibold " +
                  (statut === StatutCommandeStock.EN_COURS
                      ? "bg-yellow-100 text-yellow-800"
                      : statut === StatutCommandeStock.SOUMISE
                          ? "bg-orange-100 text-orange-800"
                          : statut === StatutCommandeStock.VALIDE
                              ? "bg-indigo-100 text-indigo-800"
                              : statut === StatutCommandeStock.LIVREE
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800")
              }
          >
            {statut === "en_cours"
                ? "Brouillon"
                : statut === "soumise"
                    ? "Soumise"
                    : statut === "valide"
                        ? "Validée"
                        : statut === "livree"
                            ? "Réceptionnée"
                            : "Annulée"}
          </span>
                </div>
            )}

            {}
            <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Entrepôt</label>
                <select
                    className="rounded border px-3 py-2 bg-white"
                    {...register("entrepotId")}
                    onChange={(e) =>
                        setValue(
                            "entrepotId",
                            e.target.value ? (Number(e.target.value) as number) : "",
                            { shouldDirty: true }
                        )
                    }
                    disabled={editingLocked}
                >
                    <option value="">Achat direct (aucun entrepôt)</option>
                    {entrepots.map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.nom}
                        </option>
                    ))}
                </select>
            </div>



            {}
            {watchEntrepotId === "" && (
                <div className="rounded border p-3 bg-amber-50 text-amber-900">
                    <div className="font-semibold mb-1">Quota 80/20 — aperçu ce mois-ci</div>
                    {loadingQuota && <div className="text-sm">Chargement…</div>}
                    {quotaErr && <div className="text-sm text-red-600">{quotaErr}</div>}
                    {!loadingQuota && !quotaErr && quotaPreview && (
                        <div className="text-sm space-y-1">
                            <div>Achats directs livrés : <b>{quotaPreview.directLivre.toFixed(2)} €</b></div>
                            <div>Total livrés : <b>{quotaPreview.totalLivre.toFixed(2)} €</b></div>
                            <div>
                                Reste direct autorisé :{" "}
                                <b>{quotaPreview.resteDirectAutorise.toFixed(2)} €</b>
                            </div>
                        </div>
                    )}
                    {!loadingQuota && !quotaErr && !quotaPreview && (
                        <div className="text-sm">Aucune donnée disponible.</div>
                    )}
                </div>
            )}






            {}
            <CataloguePanel onAdd={addProduct} disabled={editingLocked} />

            {}
            <div className="bg-white rounded-lg border p-4">
                <div className="font-semibold mb-2">Lignes</div>

                {!fields.length && (
                    <div className="text-sm text-gray-500">
                        Utilise le catalogue ci-dessus.
                    </div>
                )}

                {!!fields.length && (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-left text-gray-500">
                            <th>Produit</th>
                            <th style={{ width: 120 }}>Quantité</th>
                            <th style={{ width: 80 }}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {fields.map((f, idx) => {
                            const label =
                                picked[f.produitId]?.nom ?? `${f.produitId.slice(0, 6)}…`;
                            return (
                                <tr key={f.id} className="border-t">
                                    <td className="py-2">{label}</td>
                                    <td className="py-2">
                                        <Controller
                                            control={control}
                                            name={`lignes.${idx}.quantite`}
                                            defaultValue={f.quantite ?? 1}
                                            rules={{required: true, min: 1}}
                                            render={({field}) => (
                                                <Input
                                                    label=""
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>
                                                    ) => {
                                                        const val = Number(e.target.value);
                                                        field.onChange(Number.isNaN(val) ? 0 : val);
                                                    }}
                                                    disabled={editingLocked}
                                                />
                                            )}
                                        />
                                    </td>
                                    <td className="py-2">
                                        <button
                                            type="button"
                                            onClick={() => remove(idx)}
                                            className={`hover:underline ${
                                                editingLocked ? "text-gray-400" : "text-red-600"
                                            }`}
                                            disabled={editingLocked}
                                        >
                                            Supprimer
                                        </button>
                                    </td>

                                    {}
                                    <td className="py-2">
                                        <input
                                            type="hidden"
                                            {...register(`lignes.${idx}.produitId`, {
                                                required: true,
                                            })}
                                            defaultValue={f.produitId}
                                        />
                                    </td>
                                </tr>
                        );
                        })}
                        </tbody>
                    </table>
                )}

                {!!fields.length && (
                    <div className="flex justify-end mt-3">
                        <div className="px-3 py-2 rounded bg-gray-100 text-gray-900 font-semibold">
                            Total estimé : {fmt(total)}
                        </div>
                    </div>
                )}
            </div>

            {}
            {!editingLocked && (
                <div className="flex justify-center">
                    <Button
                        type="submit"
                        disabled={isSubmitting || !fields.length}
                        className="px-10 py-3 bg-indigo-600 text-white rounded-lg disabled:bg-gray-400"
                    >
                        {id ? "Mettre à jour" : "Créer"}
                    </Button>
                </div>
            )}
            {editingLocked && (
                <div className="text-center text-sm text-gray-600">
                    Cette commande n’est plus modifiable (statut ≠ en_cours).
                </div>
            )}

            {}
            {id && (
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                    {canSubmit && (
                        <Button
                            type="button"
                            onClick={handleSubmitWorkflow}
                            className="px-10 py-3 bg-amber-600 text-white rounded-lg"
                        >
                            Soumettre
                        </Button>
                    )}

                    {canReceive && (
                        <Button
                            type="button"
                            onClick={handleReceiveWorkflow}
                            className="px-10 py-3 bg-green-600 text-white rounded-lg"
                        >
                            Réceptionner
                        </Button>
                    )}

                    {canDelete && (
                        <Button
                            type="button"
                            onClick={handleDeleteDraft}
                            className="px-10 py-3 bg-red-600 text-white rounded-lg"
                        >
                            Supprimer
                        </Button>
                    )}
                </div>
            )}
        </form>
    );
}
