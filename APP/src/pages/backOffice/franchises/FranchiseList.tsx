import { useEffect, useState, useCallback } from "react";
import { franchiseService } from "../../../api/backOffice/franchiseService";
import { Franchise } from "../../../assets/ts/interfaces";
import FranchiseTable from "../../../components/backOffice/franchises/FranchiseTable";
import Button from "../../../components/basics/Button";
import Drawer from "../../../components/basics/Drawer";
import FranchiseDetail from "./FranchiseDetailPage";
import FranchiseForm from "./FranchiseFormPage";
import { useSearchParams } from "react-router-dom";

export default function FranchiseListPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [filteredFranchises, setFilteredFranchises] = useState<Franchise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(
    null
  );
  const [drawerType, setDrawerType] = useState<
    "detailFranchise" | "formFranchise" | null
  >(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const viewId = searchParams.get("viewFranchise");
  const formId = searchParams.get("formFranchise");

  const fetchFranchises = useCallback(async () => {
    try {
      setLoading(true);
      const data = await franchiseService.getAll();
      setFranchises(data);
      setFilteredFranchises(data);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement des franchises.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFranchises();
  }, [fetchFranchises]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredFranchises(
      franchises.filter((f) => f.nom.toLowerCase().includes(term))
    );
  }, [searchTerm, franchises]);

  useEffect(() => {
    if (formId) {
      setDrawerType("formFranchise");
      setSelectedFranchiseId(formId === "new" ? null : formId);
    } else if (viewId) {
      setDrawerType("detailFranchise");
      setSelectedFranchiseId(viewId);
    } else {
      setDrawerType(null);
      setSelectedFranchiseId(null);
    }
  }, [formId, viewId]);

  /* const openDetail = (id: string) => {
    setSearchParams({ viewFranchise: id });
  };
 */
  const openForm = (id?: string) => {
    setSearchParams({ formFranchise: id ?? "new" });
  };

  const closeDrawer = () => {
    searchParams.delete("formFranchise");
    searchParams.delete("viewFranchise");
    setSearchParams(searchParams);
  };

  const handleDelete = async (franchise: Franchise) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Confirmer la suppression de ${franchise.nom} ?`)) {
      try {
        await franchiseService.getById(franchise.id);
        fetchFranchises();
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
          <h1 className="text-3xl font-bold text-gray-800">Franchises</h1>
          <Button
            onClick={() => openForm()}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition"
          >
            + Ajouter une franchise
          </Button>
        </div>

        <div className="px-8 pt-4">
          <input
            type="text"
            placeholder="🔍 Rechercher une franchise..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto px-8 py-6">
          {error && <div className="text-red-600">{error}</div>}
          {loading ? (
            <div className="text-center text-gray-500 py-10 animate-pulse">
              Chargement des franchises...
            </div>
          ) : (
            <FranchiseTable
              data={filteredFranchises}
              onEdit={(f) => openForm(f.id)}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/*  <Drawer
          isOpen={drawerType === "detailFranchise"}
          onClose={closeDrawer}
          title="Détails de la franchise"
        >
          {selectedFranchiseId && <FranchiseDetail id={selectedFranchiseId} />}
        </Drawer> */}

        <Drawer
          isOpen={drawerType === "formFranchise"}
          onClose={closeDrawer}
          title={
            selectedFranchiseId
              ? "Modifier la franchise"
              : "Créer une franchise"
          }
        >
          <FranchiseForm
            id={selectedFranchiseId ?? undefined}
            onSuccess={() => {
              closeDrawer();
              fetchFranchises();
            }}
          />
        </Drawer>
      </div>
    </>
  );
}