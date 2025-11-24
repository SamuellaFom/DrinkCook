import { useEffect, useState, useCallback } from "react";
import { entrepotService } from "../../../api/backOffice/entrepotService";
import { Entrepot } from "../../../assets/ts/interfaces";
import Button from "../../../components/basics/Button";
import Drawer from "../../../components/basics/Drawer";
import EntrepotTable from "../../../components/backOffice/entrepots/EntrepotTable";
import { useSearchParams } from "react-router-dom";
import EntrepotForm from "./EntrepotForm";
import EntrepotDetail from "./EntrepotDetailPage";

export default function EntrepotListPage() {
  const [entrepots, setEntrepots] = useState<Entrepot[]>([]);
  const [filteredEntrepots, setFilteredEntrepots] = useState<Entrepot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedEntrepotId, setSelectedEntrepotId] = useState<number | null>(
    null
  );

  const [drawerType, setDrawerType] = useState<
    "detailEntrepot" | "formEntrepot" | null
  >(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const viewId = searchParams.get("viewEntrepot");
  const formId = searchParams.get("formEntrepot");

  const fetchEntrepots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await entrepotService.getAll();
      setEntrepots(data);
      setFilteredEntrepots(data);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement des entrepots.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntrepots();
  }, [fetchEntrepots]);

  const parseId = (id: string | null): number | null => {
    const n = Number(id);
    return Number.isNaN(n) ? null : n;
  };

  useEffect(() => {
    if (formId) {
      setDrawerType("formEntrepot");
      setSelectedEntrepotId(formId === "new" ? null : parseId(formId));
    } else if (viewId) {
      setDrawerType("detailEntrepot");
      setSelectedEntrepotId(parseId(viewId));
    } else {
      setDrawerType(null);
      setSelectedEntrepotId(null);
    }
  }, [formId, viewId]);

  const openDetail = (id: number) => {
    setSearchParams({ viewEntrepot: String(id) });
  };

  const openForm = (id?: number) => {
    setSearchParams({ formEntrepot: id ? String(id) : "new" });
  };

  const closeDrawer = () => {
    searchParams.delete("formEntrepot");
    searchParams.delete("viewEntrepot");
    setSearchParams(searchParams);
  };

  const handleDelete = async (entrepot: Entrepot) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Confirmer la suppression de ${entrepot.nom} ?`)) {
      try {
        await entrepotService.getById(entrepot.id);
        fetchEntrepots();
      } catch (err: any) {
        alert("Erreur lors de la suppression.");
        console.error(err);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-gray-50 flex flex-col">
        <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Entrepots</h1>
          <Button
            onClick={() => openForm()}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition"
          >
            + Ajouter un entrepot
          </Button>
        </div>

        <div className="flex-1 overflow-auto px-8 py-6">
          {error && <div className="text-red-600">{error}</div>}
          {loading ? (
            <div className="text-center text-gray-500 py-10 animate-pulse">
              Chargement des entrepots...
            </div>
          ) : (
            <EntrepotTable
              data={filteredEntrepots}
              onEdit={(f) => openForm(f.id)}
              onDelete={handleDelete}
              onView={(f) => openDetail(f.id)}
            />
          )}
        </div>

        <Drawer
          isOpen={drawerType === "detailEntrepot"}
          onClose={closeDrawer}
          title="Détails de la entrepot"
        >
          {selectedEntrepotId && <EntrepotDetail id={selectedEntrepotId} />}
        </Drawer>

        <Drawer
          isOpen={drawerType === "formEntrepot"}
          onClose={closeDrawer}
          title={
            selectedEntrepotId ? "Modifier l'entrepot" : "Créer un entrepot"
          }
        >
          <EntrepotForm
            id={selectedEntrepotId ?? undefined}
            onSuccess={() => {
              closeDrawer();
              fetchEntrepots();
            }}
          />
        </Drawer>
      </div>
    </>
  );
}