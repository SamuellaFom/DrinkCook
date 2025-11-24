import { useEffect, useMemo, useState, useCallback, type ChangeEvent } from "react";
import { produitFranchiseService } from "../../../api/frontOffice/ProduitFranchiseService";
import { menuService, type MenuRow } from "../../../api/frontOffice/menuService";
import {articlePrixFranchiseService} from "../../../api/frontOffice/articlePrixFranchiseService";

export type ProduitRow = {
    id: string;
    nom: string;
    prix: number;
    stockDispo?: number;
    category?: { id: number; nom?: string };
};

type Category = { id: number; nom: string };

type Props = {
    selectedProductLines?: { produitId: string; quantite: number }[];
    selectedMenuLines?: { menuId: string; quantite: number }[];

    onAddProduct: (p: ProduitRow) => void;
    onAddMenu: (m: MenuRow) => void;
};

export default function CatalogueCommandeClient({
                                                    selectedProductLines = [],
                                                    selectedMenuLines = [],
                                                    onAddProduct,
                                                    onAddMenu,
                                                }: Props) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
    const [q, setQ] = useState<string>("");

    const [isSearching, setIsSearching] = useState(false);
    const [searchErr, setSearchErr] = useState<string | null>(null);
    const [results, setResults] = useState<ProduitRow[]>([]);

    const [menus, setMenus] = useState<MenuRow[]>([]);
    const [menuErr, setMenuErr] = useState<string | null>(null);
    const [loadingMenus, setLoadingMenus] = useState(false);

    const qtyByProduit = useMemo(() => {
        const map: Record<string, number> = {};
        for (const l of selectedProductLines) {
            map[l.produitId] = (map[l.produitId] ?? 0) + Number(l.quantite || 0);
        }
        return map;
    }, [selectedProductLines]);

    const qtyByMenu = useMemo(() => {
        const map: Record<string, number> = {};
        for (const l of selectedMenuLines) {
            map[l.menuId] = (map[l.menuId] ?? 0) + Number(l.quantite || 0);
        }
        return map;
    }, [selectedMenuLines]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const list: Category[] = await produitFranchiseService.getCategory();
                if (mounted) setCategories(list ?? []);
            } catch {
                if (mounted) setCategories([]);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let timeoutId: number | undefined;
        setIsSearching(true);
        setSearchErr(null);

        timeoutId = window.setTimeout(async () => {
            try {
                const data = await articlePrixFranchiseService.search({
                    q: q || undefined,
                    categoryId: categoryId || undefined,
                    actifsOnly: true,
                });


                const rows: ProduitRow[] = (data ?? []).map((r: any) => ({
                    id: r.id,
                    nom: r.nom,
                    prix: Number(r.prix ?? r.basePrice ?? 0),
                    stockDispo: r.stockDispo,
                    category: r.category ?? undefined,
                }));

                setResults(rows);
            } catch (e: any) {
                setSearchErr(e?.message ?? "Erreur recherche");
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (timeoutId !== undefined) window.clearTimeout(timeoutId);
        };
    }, [q, categoryId]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingMenus(true);
                setMenuErr(null);
                const list = await menuService.list({ actifsOnly: true });
                if (mounted) setMenus(list ?? []);
            } catch (e: any) {
                if (mounted) {
                    setMenus([]);
                    setMenuErr(e?.message ?? "Erreur menus");
                }
            } finally {
                if (mounted) setLoadingMenus(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleAddProduct = useCallback((p: ProduitRow) => {
        if ((p.stockDispo ?? 0) <= 0) return;
        onAddProduct(p);
    }, [onAddProduct]);

    const handleAddMenu = useCallback((m: MenuRow) => {
        if ((m.stockDispo ?? 0) <= 0) return;
        onAddMenu(m);
    }, [onAddMenu]);

    return (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border">
            {}
            <div className="font-semibold">Catalogue produits</div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                    <label className="mb-1 text-sm text-gray-600">Catégorie</label>
                    <select
                        className="rounded border px-3 py-2 bg-white"
                        value={categoryId ?? ""}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            setCategoryId(e.target.value ? Number(e.target.value) : undefined)
                        }
                    >
                        <option value="">Toutes</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.nom}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 flex flex-col">
                    <label className="mb-1 text-sm text-gray-600">Recherche texte</label>
                    <input
                        className="rounded border px-3 py-2"
                        placeholder="ex: burger, cola, dessert…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
            </div>

            {}
            <div className="mt-3">
                {isSearching && <div className="text-sm text-gray-500">Recherche…</div>}
                {searchErr && <div className="text-sm text-red-600">{searchErr}</div>}
                {!isSearching && !searchErr && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.map((p) => {
                            const out = (p.stockDispo ?? 0) <= 0;
                            const low = !out && (p.stockDispo ?? 0) <= 5;
                            const chosen = qtyByProduit[p.id] ?? 0;

                            return (
                                <div key={p.id} className="flex items-center justify-between rounded border p-3 bg-white">
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {p.nom}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {p.category?.nom ? `${p.category.nom} • ` : ""}{Number(p.prix ?? 0).toFixed(2)} €
                                        </div>

                                        {typeof p.stockDispo === "number" && (
                                            <div className="mt-1">
                                                {out ? (
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">Rupture</span>
                                                ) : low ? (
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">Bas : {p.stockDispo}</span>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleAddProduct(p)}
                                        disabled={out}
                                        className={`px-3 py-1 rounded text-white ${out ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            );
                        })}
                        {!results.length && <div className="text-sm text-gray-500">Aucun produit</div>}
                    </div>
                )}
            </div>

            {}
            <div className="font-semibold mt-4">Menus</div>
            {loadingMenus && <div className="text-sm text-gray-500">Chargement…</div>}
            {menuErr && <div className="text-sm text-red-600">{menuErr}</div>}
            {!loadingMenus && !menuErr && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {menus.map((m) => {
                        const out = (m.stockDispo ?? 0) <= 0;
                        const chosen = qtyByMenu[m.id] ?? 0;
                        return (
                            <div key={m.id} className="flex items-center justify-between rounded border p-3 bg-white">
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {m.nom}
                                    </div>
                                    <div className="text-sm text-gray-600">{Number(m.prix ?? 0).toFixed(2)} €</div>
                                    {typeof m.stockDispo === "number" && (
                                        <div className="mt-1">
                                            {out ? (
                                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">Rupture</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">Dispo: {m.stockDispo}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleAddMenu(m)}
                                    disabled={out}
                                    className={`px-3 py-1 rounded text-white ${out ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
                                >
                                    Ajouter
                                </button>
                            </div>
                        );
                    })}
                    {!menus.length && <div className="text-sm text-gray-500">Aucun menu</div>}
                </div>
            )}
        </div>
    );
}
