import { useEffect, useState, useCallback } from "react";

import CommandeStockFormPage from "./CommandesStockFormPage";
import Button from "../../../components/basics/Button";
import {useSearchParams} from "react-router-dom";
import {commandeStockService} from "../../../api/frontOffice/commandeStockService";
import CommandeStockTable from "../../../components/frontOffice/commandesStocks/CommandeStockTable";
import Drawer from "../../../components/basics/Drawer";
import CommandeStockDetailsCard from "./CommandeStockDetailsCard";
import {CommandeStock} from "../../../assets/ts/FranchiseInterface";

export default function CommandeStockListPage() {
    const [rows, setRows] = useState<CommandeStock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const formId = searchParams.get("formCommandeStock");
    const viewId = searchParams.get("viewCommandeStock");

    const fetchRows = useCallback(async () => {
        try {
            setLoading(true);
            const data = await commandeStockService.list({ page: 1, limit: 20 });
            setRows(data);
            setError(null);
        } catch (err: any) {
            console.error("Erreur API:", err);
            setError(err?.message ?? "Erreur lors du chargement.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    const openForm = (id?: number) =>
            setSearchParams({ formCommandeStock: id ? String(id) : "new" });

    const openDetails = (id: number) =>
        setSearchParams({ viewCommandeStock: String(id) });

    const closeDrawer = () => setSearchParams({});

    const handleSubmit = async (c: CommandeStock) => {
            if (!window.confirm(`Soumettre la commande ${c.id_formatted} ?`)) return;
            try {
                await commandeStockService.submit(c.id);
                fetchRows();
            } catch (e: any) {
                alert(e.message ?? "Erreur soumission");
            }
        };

    const handleReceive = async (c: CommandeStock) => {
        if (!window.confirm(`Réceptionner la commande ${c.id_formatted} ?`)) return;
        try {
            await commandeStockService.receive(c.id);
            fetchRows();
        } catch (e: any) {
            alert(e.message ?? "Erreur réception");
        }
    };

    const handleDelete = async (c: CommandeStock) => {
        if (!window.confirm(`Supprimer le brouillon ${c.id_formatted} ?`)) return;
        try {
            await commandeStockService.remove(c.id);
            fetchRows();
        } catch (e: any) {
            alert(e.message ?? "Erreur suppression");
        }
    };

    const drawerType =
            formId ? "form" :
                viewId ? "detail" :
                    null;

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">
            {}
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Commandes de stock</h1>
                <Button
                    onClick={() => openForm()}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition"
                >
                    + Nouvelle commande
                </Button>
            </div>

            {}
            <div className="flex-1 overflow-auto px-8 py-6">
                {error && <div className="text-red-600 mb-4">{error}</div>}
                {loading ? (
                    <div className="text-center text-gray-500 py-10 animate-pulse">
                        Chargement…
                    </div>
                ) : (
                    <CommandeStockTable
                        data={rows}
                        onView={(c) => openDetails(c.id)}
                        onEdit={(c) => openForm(c.id)}
                        onSubmit={handleSubmit}
                        onReceive={handleReceive}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {}
            <Drawer
                isOpen={drawerType === "detail"}
                onClose={closeDrawer}
                title="Détails de la commande de stock"
            >
                {viewId && (
                    <CommandeStockDetailsCard
                        id={Number(viewId)}
                        onEdit={(id) => setSearchParams({ formCommandeStock: String(id) })}
                        onSubmitted={() => { closeDrawer(); fetchRows(); }}
                        onReceived={() => { closeDrawer(); fetchRows(); }}
                        onDeleted={() => { closeDrawer(); fetchRows(); }}
                    />
                )}
            </Drawer>

            {}
            <Drawer
                isOpen={drawerType === "form"}
                onClose={closeDrawer}
                title={formId && formId !== "new"
                    ? "Modifier la commande de stock"
                    : "Créer une commande de stock"}
            >
                <CommandeStockFormPage
                    id={formId && formId !== "new" ? Number(formId) : undefined}
                    onSuccess={() => { closeDrawer(); fetchRows(); }}
                />
            </Drawer>
        </div>
    );
}
