import { useMemo, useState, useCallback, type ChangeEvent } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import Button from "../../../components/basics/Button";
import Input from "../../../components/basics/Input";
import { commandeClientService, type CreateCommandeClientPayload } from "../../../api/frontOffice/commandeClientService";
import ClientQuickLookup, { ClientLite } from "../../../components/frontOffice/clients/ClientQuickLookup";
import { clientService } from "../../../api/frontOffice/clientService";
import { type MenuRow } from "../../../api/frontOffice/menuService";
import CatalogueCommandeClient, {ProduitRow} from "../../../components/frontOffice/commandesClients/CataloguePanel";

export default function CommandeClientFormPage({ onSuccess }: { onSuccess: () => void }) {
    const { control, register, handleSubmit, setValue, formState: { isSubmitting } } =
        useForm<CreateCommandeClientPayload>({ defaultValues: { clientId: "", lignes: [], menus: [] } });

    const { fields, append, remove, update } = useFieldArray({ control, name: "lignes" });
    const { fields: menuFields, append: appendMenu, remove: removeMenu, update: updateMenu } =
        useFieldArray({ control, name: "menus" });

    const [selectedClient, setSelectedClient] = useState<ClientLite | null>(null);
    const [clientPoints, setClientPoints] = useState<number | null>(null);
    const [useLoyalty, setUseLoyalty] = useState(false);

    const [picked, setPicked] = useState<Record<string, ProduitRow>>({});
    const [pickedMenus, setPickedMenus] = useState<Record<string, MenuRow>>({});

    const lignesValues = useWatch({ control, name: "lignes" });
    const menusValues = useWatch({ control, name: "menus" });

    const total = useMemo(() => {
        const totalProd = (lignesValues ?? []).reduce((sum, l) => {
            const p = picked[l.produitId];
            const price = p ? Number(p.prix ?? 0) : 0;
            const qty = Number(l?.quantite ?? 0);
            return sum + price * qty;
        }, 0);

        const totalMenus = (menusValues ?? []).reduce((sum, m) => {
            const menu = pickedMenus[m.menuId];
            const price = menu ? Number((menu as any).prix ?? 0) : 0;
            const qty = Number(m?.quantite ?? 0);
            return sum + price * qty;
        }, 0);

        return totalProd + totalMenus;
    }, [lignesValues, picked, menusValues, pickedMenus]);

    const fmt = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

    const addProduct = useCallback((p: ProduitRow) => {
        if ((p.stockDispo ?? 0) <= 0) return;
        const index = (lignesValues ?? []).findIndex((f) => f.produitId === p.id);
        if (index >= 0) {
            update(index, { ...lignesValues![index], quantite: Number(lignesValues![index].quantite) + 1 });
        } else {
            append({ produitId: p.id, quantite: 1 });
        }
        setPicked((prev) => ({ ...prev, [p.id]: p }));
    }, [append, lignesValues, update]);

    const addMenu = useCallback((m: MenuRow) => {
        if ((m.stockDispo ?? 0) <= 0) return;
        const idx = (menusValues ?? []).findIndex((f) => f.menuId === m.id);
        if (idx >= 0) {
            updateMenu(idx, { ...menusValues![idx], quantite: Number(menusValues![idx].quantite) + 1 });
        } else {
            appendMenu({ menuId: m.id, quantite: 1 });
        }
        setPickedMenus((prev) => ({ ...prev, [m.id]: m }));
    }, [appendMenu, menusValues, updateMenu]);

    const onSubmit = async (data: CreateCommandeClientPayload) => {
        try {
            const payload: CreateCommandeClientPayload = {
                clientId: data.clientId ? data.clientId : null,
                lignes: (data.lignes ?? []).map((l) => ({ produitId: l.produitId, quantite: Number(l.quantite) })),
                menus: (data.menus ?? []).map((m) => ({ menuId: m.menuId, quantite: Number(m.quantite) })),
                utiliserPointsFidelite: !!useLoyalty,
            };
            await commandeClientService.create(payload);
            onSuccess();
        } catch (e: any) {
            alert(e?.message ?? "Erreur lors de la création");
        }
    };

    return (
        <form className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {}
            <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Client (optionnel)</label>
                {selectedClient ? (
                    <div className="flex items-center justify-between rounded border px-3 py-2 bg-white">
                        <div className="text-sm text-gray-700">
                            <span className="font-medium">{selectedClient.nom}</span>
                            {selectedClient.email ? ` — ${selectedClient.email}` : null}
                        </div>
                        <button
                            type="button"
                            className="text-sm text-red-600 hover:underline"
                            onClick={() => {
                                setSelectedClient(null);
                                setValue("clientId", "", { shouldDirty: true, shouldValidate: true });
                                setClientPoints(null);
                                setUseLoyalty(false);
                            }}
                        >
                            Effacer
                        </button>
                    </div>
                ) : (
                    <ClientQuickLookup
                        onPick={async (c) => {
                            setSelectedClient(c);
                            setValue("clientId", c.id, { shouldDirty: true, shouldValidate: true });
                            try {
                                const details = await clientService.getDetails(c.id);
                                const carte = (details.cartesFidelite || [])[0];
                                const pts = Number(carte?.points ?? 0);
                                setClientPoints(pts);
                                setUseLoyalty(false);
                            } catch {
                                setClientPoints(null);
                                setUseLoyalty(false);
                            }
                        }}
                    />
                )}

                <input type="hidden" {...register("clientId")} />

                {selectedClient && (
                    <div className="mt-2 text-sm">
                        <label className="inline-flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={useLoyalty}
                                onChange={(e) => setUseLoyalty(e.target.checked)}
                                disabled={(clientPoints ?? 0) < 100}
                            />
                            <span className={(clientPoints ?? 0) < 50 ? "text-gray-400" : "text-gray-800"}>
                Utiliser 100 points (-5,00 €)
              </span>
                        </label>
                    </div>
                )}
            </div>

            {}
            <CatalogueCommandeClient
                selectedProductLines={lignesValues ?? []}
                selectedMenuLines={menusValues ?? []}
                onAddProduct={addProduct}
                onAddMenu={addMenu}
            />

            {}
            <div className="bg-white rounded-lg border p-4">
                <div className="font-semibold mb-2">Lignes</div>
                {fields.length === 0 && <div className="text-sm text-gray-500">Utilise le catalogue ci-dessus pour ajouter des produits.</div>}
                {fields.length > 0 && (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-left text-gray-500"><th>Produit</th><th style={{ width: 120 }}>Quantité</th><th style={{ width: 80 }}></th></tr>
                        </thead>
                        <tbody>
                        {fields.map((f, idx) => {
                            const label = picked[f.produitId]?.nom ?? `${f.produitId.slice(0, 6)}…`;
                            return (
                                <tr key={f.id} className="border-t">
                                    <td className="py-2">{label}</td>
                                    <td className="py-2">
                                        <Controller
                                            control={control}
                                            name={`lignes.${idx}.quantite`}
                                            defaultValue={f.quantite ?? 1}
                                            rules={{ required: true, min: 1 }}
                                            render={({ field }) => (
                                                <Input
                                                    label=""
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                        const val = Number(e.target.value);
                                                        field.onChange(Number.isNaN(val) ? 0 : val);
                                                    }}
                                                />
                                            )}
                                        />
                                    </td>
                                    <td className="py-2">
                                        <button type="button" onClick={() => remove(idx)} className="text-red-600 hover:underline">Supprimer</button>
                                    </td>
                                    <input type="hidden" {...register(`lignes.${idx}.produitId`, { required: true })} defaultValue={f.produitId} />
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            {}
            {menuFields.length > 0 && (
                <div className="bg-white rounded-lg border p-4 mt-4">
                    <div className="font-semibold mb-2">Menus</div>
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-left text-gray-500"><th>Menu</th><th style={{ width: 120 }}>Quantité</th><th style={{ width: 80 }}></th></tr>
                        </thead>
                        <tbody>
                        {menuFields.map((f, idx) => {
                            const label = pickedMenus[f.menuId]?.nom ?? `${f.menuId.slice(0, 6)}…`;
                            return (
                                <tr key={f.id} className="border-t">
                                    <td className="py-2">{label}</td>
                                    <td className="py-2">
                                        <Controller
                                            control={control}
                                            name={`menus.${idx}.quantite`}
                                            defaultValue={f.quantite ?? 1}
                                            rules={{ required: true, min: 1 }}
                                            render={({ field }) => (
                                                <Input
                                                    label=""
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                        const val = Number(e.target.value);
                                                        field.onChange(Number.isNaN(val) ? 0 : val);
                                                    }}
                                                />
                                            )}
                                        />
                                    </td>
                                    <td className="py-2">
                                        <button type="button" onClick={() => removeMenu(idx)} className="text-red-600 hover:underline">Supprimer</button>
                                    </td>
                                    <input type="hidden" {...register(`menus.${idx}.menuId`, { required: true })} defaultValue={f.menuId} />
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {(fields.length > 0 || menuFields.length > 0) && (
                <div className="flex justify-end">
                    <div className="px-3 py-2 rounded bg-gray-100 text-gray-900 font-semibold">Total estimé : {fmt(total)}</div>
                </div>
            )}

            <div className="flex justify-center">
                <Button type="submit" disabled={isSubmitting || (fields.length === 0 && menuFields.length === 0)} className="px-10 py-3 bg-indigo-600 text-white rounded-lg disabled:bg-gray-400">
                    Créer
                </Button>
            </div>
        </form>
    );
}
