import { useEffect, useState, useCallback } from "react";
import { camionService } from "../../../api/backOffice/camionService";
import { Camion } from "../../../assets/ts/interfaces";
import Button from "../../../components/basics/Button";
import Drawer from "../../../components/basics/Drawer";
import CamionTable from "../../../components/backOffice/camions/CamionTable";
import { useSearchParams } from "react-router-dom";
import CamionForm from "./CamionFormPage";
import CamionDetail from "./CamionDetailPage";
import EntretienForm from "../../../components/backOffice/entretiens/EntretienFormPage";
import AssignCamionForm from "./AssignCamion";

export default function CamionListPage() {
  const [camions, setCamions] = useState<Camion[]>([]);
  const [filteredCamions, setFilteredCamions] = useState<Camion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCamionId, setSelectedCamionId] = useState<number | null>(null);

  const [drawerType, setDrawerType] = useState<
    | "detailCamion"
    | "formCamion"
    | "formEntretien"
    | "formEmplacement"
    | null
  >(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const viewId = searchParams.get("viewCamion");
  const formType = searchParams.get("formType");
  const formId = searchParams.get("formId");

  const fetchCamions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await camionService.getAll();
      setCamions(data);
      setFilteredCamions(data);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement des camions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCamions();
  }, [fetchCamions]);

  const parseId = (id: string | null): number | null => {
    const n = Number(id);
    return Number.isNaN(n) ? null : n;
  };

  useEffect(() => {
    if (formType) {
      setDrawerType(formType as typeof drawerType);
      setSelectedCamionId(formId === "new" ? null : parseId(formId));
    } else if (viewId) {
      setDrawerType("detailCamion");
      setSelectedCamionId(parseId(viewId));
    } else {
      setDrawerType(null);
      setSelectedCamionId(null);
    }
  }, [formType, formId, viewId]);

  const openDetail = (id: number) => {
    setSearchParams({ viewCamion: String(id) });
  };

  const openForm = (
    type: Exclude<typeof drawerType, "detailCamion" | null>,
    id?: number
  ) => {
    setSearchParams({ formType: type, formId: id ? String(id) : "new" });
  };

  const closeDrawer = () => {
    searchParams.delete("formType");
    searchParams.delete("formId");
    searchParams.delete("viewCamion");
    setSearchParams(searchParams);
  };

  const handleDelete = async (camion: Camion) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Confirmer la suppression de ${camion.immatriculation} ?`)) {
      try {
        await camionService.getById(camion.id);
        fetchCamions();
      } catch (err: any) {
        alert("Erreur lors de la suppression.");
        console.error(err);
      }
    }
  };

  console.log(drawerType);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Camions</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => openForm("formCamion")}
            className="btn-primary"
          >
            + Ajouter un camion
          </Button>
          <Button
            onClick={() => openForm("formEntretien")}
            className="btn-primary"
          >
            + Ajouter un entretien
          </Button>
          <Button
            onClick={() => openForm("formEmplacement")}
            className="btn-primary"
          >
            + Ajouter un emplacement
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {error && <div className="text-red-600">{error}</div>}
        {loading ? (
          <div className="text-center text-gray-500 py-10 animate-pulse">
            Chargement des camions...
          </div>
        ) : (
          <CamionTable
            data={filteredCamions}
            onEdit={(f) => openForm("formCamion", f.id)}
            onDelete={handleDelete}
            onView={(f) => openDetail(f.id)}
          />
        )}
      </div>

      {/* DRAWERS */}
      <Drawer
        isOpen={drawerType === "detailCamion"}
        onClose={closeDrawer}
        title="Détails du camion"
      >
        {selectedCamionId && <CamionDetail id={selectedCamionId} />}
      </Drawer>

      <Drawer
        isOpen={drawerType === "formCamion"}
        onClose={closeDrawer}
        title={selectedCamionId ? "Modifier le camion" : "Créer un camion"}
      >
        <CamionForm
          id={selectedCamionId ?? undefined}
          onSuccess={() => {
            closeDrawer();
            fetchCamions();
          }}
        />
      </Drawer>

      <Drawer
        isOpen={drawerType === "formEntretien"}
        onClose={closeDrawer}
        title="Ajouter un entretien"
      >
        <EntretienForm
          onSuccess={() => {
            closeDrawer();
            fetchCamions();
          }}
        />
      </Drawer>

      <Drawer
        isOpen={drawerType === "formEmplacement"}
        onClose={closeDrawer}
        title="Assigner un camion"
      >
        <AssignCamionForm />
      </Drawer>
    </div>
  );
}