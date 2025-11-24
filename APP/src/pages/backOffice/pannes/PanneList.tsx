import { useEffect, useState, useCallback } from "react";
import { panneService } from "../../../api/backOffice/panneService";
import { Panne } from "../../../assets/ts/interfaces";
import Button from "../../../components/basics/Button";
import Drawer from "../../../components/basics/Drawer";
import PanneTable from "../../../components/backOffice/pannes/PanneTable";
import { useSearchParams } from "react-router-dom";
import PanneForm from "../../../components/backOffice/pannes/PanneFormPage";
import PanneDetail from "./PanneDetailPage";

export default function PanneListPage() {
  const [pannes, setPannes] = useState<Panne[]>([]);
  const [filteredPannes, setFilteredPannes] = useState<Panne[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPanneId, setSelectedPanneId] = useState<number | null>(null);

  const [drawerType, setDrawerType] = useState<
    "detailPanne" | "formPanne" | null
  >(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const viewId = searchParams.get("viewPanne");
  const formId = searchParams.get("formPanne");

  const fetchPannes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await panneService.getAll();
      setPannes(data);
      setFilteredPannes(data);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement des pannes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPannes();
  }, [fetchPannes]);

  const parseId = (id: string | null): number | null => {
    const n = Number(id);
    return Number.isNaN(n) ? null : n;
  };

  useEffect(() => {
    if (formId) {
      setDrawerType("formPanne");
      setSelectedPanneId(formId === "new" ? null : parseId(formId));
    } else if (viewId) {
      setDrawerType("detailPanne");
      setSelectedPanneId(parseId(viewId));
    } else {
      setDrawerType(null);
      setSelectedPanneId(null);
    }
  }, [formId, viewId]);

  const openDetail = (id: number) => {
    setSearchParams({ viewPanne: String(id) });
  };

  const openForm = (id?: number) => {
    setSearchParams({ formPanne: id ? String(id) : "new" });
  };

  const closeDrawer = () => {
    searchParams.delete("formPanne");
    searchParams.delete("viewPanne");
    setSearchParams(searchParams);
  };

  const handleDelete = async (panne: Panne) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Confirmer la suppression de ${panne.id} ?`)) {
      try {
        await panneService.getById(panne.id);
        fetchPannes();
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
          <h1 className="text-3xl font-bold text-gray-800">Pannes</h1>
          <Button
            onClick={() => openForm()}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition"
          >
            + Ajouter un panne
          </Button>
        </div>

        <div className="flex-1 overflow-auto px-8 py-6">
          {error && <div className="text-red-600">{error}</div>}
          {loading ? (
            <div className="text-center text-gray-500 py-10 animate-pulse">
              Chargement des pannes...
            </div>
          ) : (
            <PanneTable
              data={filteredPannes}
              onEdit={(f: { id: number | undefined; }) => openForm(f.id)}
              onDelete={handleDelete}
              onView={(f: { id: number; }) => openDetail(f.id)}
            />
          )}
        </div>

        <Drawer
          isOpen={drawerType === "detailPanne"}
          onClose={closeDrawer}
          title="Détails de la panne"
        >
          {selectedPanneId && <PanneDetail id={selectedPanneId} />}
        </Drawer>

        <Drawer
          isOpen={drawerType === "formPanne"}
          onClose={closeDrawer}
          title={
            selectedPanneId ? "Modifier de la Panne" : "Créer un panne"
          }
        >
          <PanneForm
            id={selectedPanneId ?? undefined}
            onSuccess={() => {
              closeDrawer();
              fetchPannes();
            }}
          />
        </Drawer>
      </div>
    </>
  );
}