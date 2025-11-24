import { useCallback, useEffect, useState } from "react";
import Button from "../../../components/basics/Button";
import Drawer from "../../../components/basics/Drawer";
import { useSearchParams } from "react-router-dom";
import { commandeClientService, type CommandeClient } from "../../../api/frontOffice/commandeClientService";

import { clientService } from "../../../api/frontOffice/clientService";
import CommandeClientDetailsCard from "./CommandeDetailsCard";
import CommandeClientFormPage from "./CommandeFormPage";
import CommandeClientTable from "../../../components/frontOffice/commandesClients/CommandeTable";

export default function CommandeClientListPage() {
    const [rows, setRows] = useState<CommandeClient[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const viewId = searchParams.get("viewCmd");
    const isFormOpen = searchParams.get("newCmd") === "1";

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await commandeClientService.list({ page: 1, limit: 20 });
            setRows(data);
            setErr(null);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openForm = () => setSearchParams({ newCmd: "1" });
    const openView = (id: string) => setSearchParams({ viewCmd: id });
    const closeDrawer = () => {
        searchParams.delete("newCmd");
        searchParams.delete("viewCmd");
        setSearchParams(searchParams);
    };

    const handlePay = async (cmd: CommandeClient) => {
        if (!window.confirm(`Confirmer le paiement de la commande ${cmd.id} ?`)) return;

        let utiliserPoints = false;
        try {
            if (cmd.client) {
                const details = await clientService.getDetails(cmd.client.id);
                const carte = (details.cartesFidelite || []).find((c: any) => c.franchise?.id === cmd.franchise?.id);
                const pts = Number(carte?.points ?? 0);

            }
            await commandeClientService.pay(cmd.id, { utiliserPoints });
            load();
        } catch (e: any) {
            alert(e?.message ?? "Erreur lors du paiement");
        }
    };

    const handleCancel = async (cmd: CommandeClient) => {
        if (!window.confirm(`Annuler la commande ${cmd.id} ?`)) return;
        try { await commandeClientService.cancel(cmd.id); load(); }
        catch (e: any) { alert(e?.message ?? "Erreur lors de l'annulation"); }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Commandes clients</h1>
                <Button onClick={openForm} className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition">
                    + Nouvelle commande
                </Button>
            </div>

            <div className="flex-1 overflow-auto px-8 py-6">
                {err && <div className="text-red-600 mb-4">{err}</div>}
                {loading ? (
                    <div className="text-center text-gray-500 py-10 animate-pulse">Chargement…</div>
                ) : (
                    <CommandeClientTable data={rows} onView={(c) => openView(c.id)} onPay={handlePay} onCancel={handleCancel} />
                )}
            </div>

            <Drawer isOpen={isFormOpen} onClose={closeDrawer} title="Créer une commande">
                <CommandeClientFormPage onSuccess={() => { closeDrawer(); load(); }} />
            </Drawer>

            <Drawer isOpen={!!viewId} onClose={closeDrawer} title="Détails de la commande">
                {viewId && (
                    <CommandeClientDetailsCard
                        id={viewId}
                        onPaid={() => { closeDrawer(); load(); }}
                        onCanceled={() => { closeDrawer(); load(); }}
                    />
                )}
            </Drawer>
        </div>
    );
}
