import { useEffect, useState } from "react";
import {Produit} from "../../../assets/ts/interfaces";
import {produitService} from "../../../api/backOffice/produitService";
import {produitFranchiseService} from "../../../api/frontOffice/ProduitFranchiseService";

type Props = {
    onAdd: (p: Produit) => void;
    disabled?: boolean;
    className?: string;
    defaultQuery?: string;
    defaultCategoryId?: number;
};

type Category = { id: number; nom: string };

export function CataloguePanel({
                                        onAdd,
                                        disabled,
                                        className,
                                        defaultQuery = "",
                                        defaultCategoryId,
                                    }: Props) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState<number | undefined>(
        defaultCategoryId
    );
    const [q, setQ] = useState<string>(defaultQuery);
    const [results, setResults] = useState<Produit[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchErr, setSearchErr] = useState<string | null>(null);

    useEffect(() => {
        produitFranchiseService.getCategory().then(setCategories).catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        let t: number | undefined;
        setIsSearching(true);
        setSearchErr(null);

        t = window.setTimeout(async () => {
            try {
                const data = await produitFranchiseService.search({
                    q: q || undefined,
                    categoryId: categoryId || undefined,
                });
                setResults(data);
            } catch (e: any) {
                setSearchErr(e?.message ?? "Erreur recherche");
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (t !== undefined) window.clearTimeout(t);
        };
    }, [q, categoryId]);

    return (
        <div className={`bg-gray-50 rounded-lg p-4 space-y-3 border ${className ?? ""}`}>
            <div className="font-semibold">Catalogue produits</div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                    <label className="mb-1 text-sm text-gray-600">Catégorie</label>
                    <select
                        className="rounded border px-3 py-2 bg-white"
                        value={categoryId ?? ""}
                        onChange={(e) =>
                            setCategoryId(e.target.value ? Number(e.target.value) : undefined)
                        }
                        disabled={disabled}
                    >
                        <option value="">Toutes</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nom}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 flex flex-col">
                    <label className="mb-1 text-sm text-gray-600">Recherche</label>
                    <input
                        className="rounded border px-3 py-2"
                        placeholder="ex: pain, boisson…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>

            {}
            <div className="mt-3">
                {isSearching && <div className="text-sm text-gray-500">Recherche…</div>}
                {searchErr && <div className="text-sm text-red-600">{searchErr}</div>}
                {!isSearching && !searchErr && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between rounded border p-3 bg-white"
                            >
                                <div>
                                    <div className="font-medium">{p.nom}</div>
                                    <div className="text-sm text-gray-600">
                                        {p.category?.nom} • {Number(p.prix ?? 0).toFixed(2)} €
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onAdd(p)}
                                    className={`px-3 py-1 rounded text-white ${
                                        disabled ? "bg-gray-400" : "bg-black hover:bg-gray-800"
                                    }`}
                                    disabled={disabled}
                                >
                                    Ajouter
                                </button>
                            </div>
                        ))}
                        {!results.length && (
                            <div className="text-sm text-gray-500">Aucun produit</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CataloguePanel;
