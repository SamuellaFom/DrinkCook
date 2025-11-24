import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ClientForm from "./ClientFormPage";
import {Client} from "../../../assets/ts/FranchiseInterface";
import {clientService} from "../../../api/frontOffice/clientService";
import Button from "../../../components/basics/Button";
import ClientTable from "../../../components/frontOffice/clients/ClientTable";
import Drawer from "../../../components/basics/Drawer";
import ClientDetailsDrawer from "./ClientDetailsDrawer";


export default function ClientListPage() {

    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [drawerType, setDrawerType] = useState<"formClient" | "detailsClient" | null>(null);


    const [searchParams, setSearchParams] = useSearchParams();

    const formId = searchParams.get("formClient");
    const detailsId = searchParams.get("detailsClient");


    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            const data = await clientService.listClients();
            setClients(data);
            setFilteredClients(data);
            setError(null);
        } catch (err: any) {
            console.error("Erreur API:", err);
            setError(err?.message ?? "Erreur lors du chargement des clients.");
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        if (formId) {
            setDrawerType("formClient");
            setSelectedClientId(formId === "new" ? null : formId);
        } else if (detailsId) {
            setDrawerType("detailsClient");
            setSelectedClientId(detailsId);
        } else {
            setDrawerType(null);
            setSelectedClientId(null);
        }
    }, [formId, detailsId]);


    const openForm = (id?: string) => {
        setSearchParams({ formClient: id ?? "new" });
    };

    const openDetails = (id: string) => setSearchParams({ detailsClient: id });

    const closeDrawer = () => {
        searchParams.delete("formClient");
        searchParams.delete("detailsClient");
        setSearchParams(searchParams);
    };


    const handleDelete = async (client: Client) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Confirmer la suppression de ${client.nom} ?`)) {
            try {
                await clientService.delete(client.id);
                fetchClients();
            } catch (err: any) {
                alert("Erreur lors de la suppression.");
                console.error(err);
            }
        }
    };


    useEffect(() => {
        if (formId) {
            setDrawerType("formClient");
            setSelectedClientId(formId === "new" ? null : formId);
        } else if (detailsId) {
            setDrawerType("detailsClient");
            setSelectedClientId(detailsId);
        } else {
            setDrawerType(null);
            setSelectedClientId(null);
        }
    }, [formId, detailsId]);


    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">
            {}
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
                <Button
                    onClick={() => openForm()}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition"
                >
                    + Ajouter un client
                </Button>
            </div>

            {}
            <div className="flex-1 overflow-auto px-8 py-6">
                {error && <div className="text-red-600 mb-4">{error}</div>}

                {loading ? (
                    <div className="text-center text-gray-500 py-10 animate-pulse">
                        Chargement des clients...
                    </div>
                ) : (
                    <ClientTable
                        data={filteredClients}
                        onView={(client) => openDetails(client.id)}
                        onEdit={(client) => openForm(client.id)}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {}
            <Drawer
                isOpen={drawerType === "formClient"}
                onClose={closeDrawer}
                title={selectedClientId ? "Modifier le client" : "Créer un client"}
            >
                <ClientForm
                    id={selectedClientId ?? undefined}
                    onSuccess={() => {
                        closeDrawer();
                        fetchClients();
                    }}
                />
            </Drawer>



            <Drawer
                isOpen={drawerType === "detailsClient"}
                onClose={closeDrawer}
                title="Détails du client"
            >
                <ClientDetailsDrawer
                    id={selectedClientId ?? ""}
                    onClose={closeDrawer}
                />
            </Drawer>




        </div>
    );
}
