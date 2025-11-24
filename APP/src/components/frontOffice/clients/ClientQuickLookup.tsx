import { useEffect, useState } from "react";
import { clientService } from "../../../api/frontOffice/clientService";

export type ClientLite = { id: string; nom: string; email?: string | null };

export default function ClientQuickLookup({ onPick }: { onPick: (c: ClientLite) => void }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<ClientLite[]>([]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setRows([]);
            return;
        }
        const t = window.setTimeout(async () => {
            try {
                setLoading(true);
                const data = await clientService.listClients({ q: query, limit: 8 } as any);
                setRows((data ?? []).map((c: any) => ({ id: c.id, nom: c.nom, email: c.email })));
            } catch (e) {
                console.warn("Lookup client error", e);
                setRows([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [query]);

    return (
        <div className="relative">
            <input
                className="rounded border px-3 py-2 bg-white w-full"
                placeholder="Nom ou email…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
            />

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded border bg-white shadow z-10">
                    {loading && <div className="px-3 py-2 text-sm text-gray-500">Recherche…</div>}
                    {!loading && query.trim().length >= 2 && rows.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
                    )}
                    {!loading &&
                        rows.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => onPick(c)}
                            >
                                <div className="text-sm font-medium">{c.nom}</div>
                                <div className="text-xs text-gray-600">{c.email}</div>
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}
