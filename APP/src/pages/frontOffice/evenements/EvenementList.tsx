import {useEffect, useState, useCallback} from "react";
import {useSearchParams} from "react-router-dom";
import {Evenement} from "../../../assets/ts/FranchiseInterface";
import {evenementService} from "../../../api/frontOffice/evenementService";
import Button from "../../../components/basics/Button";
import EvenementTable from "../../../components/frontOffice/evenements/EvenementTable";
import Drawer from "../../../components/basics/Drawer";
import EvenementFormPage from "./EvenementFormPage";
import EvenementDetail from "./EvenementDetailPage";


export default function EvenementList() {
    const [evenements, setEvenements] = useState<Evenement[]>([]);
    const [filteredEvenements, setFilteredEvenements] = useState<Evenement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedEvenementId, setSelectedEvenemntId] = useState<string | null>(null);

    const [drawerType, setDrawerType] = useState<
        "detailEvenement" | "formEvenement" | null
    >(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const formId = searchParams.get("formEvenement");
    const viewId = searchParams.get("viewEvenement");

    const fetchEvenements = useCallback(async () => {
        try {
            setLoading(true);
            const data = await evenementService.listEvenements();
            setEvenements(data);
            setFilteredEvenements(data);
        } catch (err: any) {
            console.error("Erreur API:", err);
            setError(err?.message ?? "Erreur lors du chargement des evenemnts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvenements();
    }, [fetchEvenements]);


    useEffect(() => {
        if (formId) {
            setDrawerType("formEvenement");
            setSelectedEvenemntId(formId === "new" ? null : formId);
        } else if (viewId) {
            setDrawerType("detailEvenement");
            setSelectedEvenemntId(viewId);
        } else {
            setDrawerType(null);
            setSelectedEvenemntId(null);
        }
    }, [formId, viewId]);

    const openDetail = (id: string) => {
        setSearchParams({viewEvenement: String(id)});
    };

    const openForm = (id?: string) => {
        setSearchParams({formEvenement: id ? String(id) : "new"});
    };


    const closeDrawer = () => {
        searchParams.delete("formEvenement");
        searchParams.delete("viewEvenement");
        setSearchParams(searchParams);
    };

    const handleDelete = async (evenement: Evenement) => {
        if (!window.confirm(`Supprimer l’événement « ${evenement.titre} » ?`)) return;
        try {
            await evenementService.delete(evenement.id);
            fetchEvenements();
        } catch (e: any) {
            alert(e?.message ?? "Erreur lors de la suppression");
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Événements</h1>
                <Button
                    onClick={() => openForm()}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition"
                >
                    + Nouvel événement
                </Button>
            </div>


            <div className="flex-1 overflow-auto px-8 py-6">
                {error && <div className="text-red-600 mb-4">{error}</div>}
                {loading ? (
                    <div className="text-center text-gray-500 py-10 animate-pulse">
                        Chargement des événements...
                    </div>
                ) : (
                    <EvenementTable
                        data={filteredEvenements}
                        onView={(e) => openDetail(e.id)}
                        onEdit={(e) => openForm(e.id)}
                        onDelete={handleDelete}
                    />
                )}
            </div>


            {}
            <Drawer
                isOpen={drawerType === "detailEvenement"}
                onClose={closeDrawer}
                title="Détails du evenement"
            >
                {selectedEvenementId && <EvenementDetail id={selectedEvenementId} />}
            </Drawer>


            {}
            <Drawer
                isOpen={drawerType === "formEvenement"}
                onClose={closeDrawer}
                title={selectedEvenementId ? "Modifier l'evenement" : "Créer un evenement"}
            >
                <EvenementFormPage
                    id={selectedEvenementId ?? undefined}
                    onSuccess={() => {
                        closeDrawer();
                        fetchEvenements();
                    }}
                />
            </Drawer>
        </div>

);
}



