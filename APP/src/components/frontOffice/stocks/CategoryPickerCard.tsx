import { useEffect, useState } from "react";
import {produitFranchiseService} from "../../../api/frontOffice/ProduitFranchiseService";

type Category = { id: number; nom: string };

export default function CategoryPickerCard({
                                               value,
                                               onChange,
                                           }: {
    value?: number;
    onChange: (id?: number) => void;
}) {
    const [cats, setCats] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const data = await produitFranchiseService.getCategory();
                setCats(data || []);
            } catch (e: any) {
                setErr(e?.message ?? "Erreur chargement catégories");
                setCats([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <aside className="bg-white rounded-xl shadow-md flex flex-col">
            <div className="px-4 py-3 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Catégories</h3>
                <p className="text-xs text-gray-400">Sélectionnez pour voir le stock</p>
            </div>

            <div className="overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 16rem)" }}>
                <button
                    onClick={() => onChange(undefined)}
                    className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors duration-150 ${
                        value == null ? "bg-blue-50" : ""
                    }`}
                >
                    <div className="font-medium text-gray-700">Toutes</div>
                    <div className="text-xs text-gray-400">Sans filtre</div>
                </button>

                {loading && <div className="px-4 py-3 text-sm text-gray-500">Chargement…</div>}
                {err && <div className="px-4 py-3 text-sm text-red-600">{err}</div>}

                {!loading && !err && cats.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => onChange(c.id)}
                        className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors duration-150 ${
                            value === c.id ? "bg-blue-50" : ""
                        }`}
                    >
                        <div className="font-medium text-gray-700">{c.nom}</div>
                    </button>
                ))}
            </div>
        </aside>
    );
}
