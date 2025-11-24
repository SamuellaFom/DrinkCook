import { useEffect, useState, useCallback } from "react";
import { produitService } from "../../../api/backOffice/produitService";
import { Produit } from "../../../assets/ts/interfaces";
import Button from "../../../components/basics/Button";
import Drawer from "../../../components/basics/Drawer";
import ProduitTable from "../../../components/backOffice/produits/ProduitTable";
import ProduitForm from "./ProduitForm";
import { useSearchParams } from "react-router-dom";

export default function ProduitListPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filteredProduit, setFilteredProduit] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduitId, setSelectedProduitId] = useState<string | null>(
    null
  );

  const [drawerType, setDrawerType] = useState<
    "detailProduit" | "formProduit" | null
  >(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const formId = searchParams.get("formProduit");

  const fetchProduits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await produitService.getAll();
      setProduits(data);
      setFilteredProduit(data);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement des produits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProduits();
  }, [fetchProduits]);

  useEffect(() => {
    if (formId) {
      setDrawerType("formProduit");
      setSelectedProduitId(formId === "new" ? null : formId);
    } else {
      setDrawerType(null);
      setSelectedProduitId(null);
    }
  }, [formId]);

  const openForm = (id?: string) => {
    setSearchParams({ formProduit: id ?? "new" });
  };

  const closeDrawer = () => {
    searchParams.delete("formProduit");
    setSearchParams(searchParams);
  };

  const handleDelete = async (produit: Produit) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Confirmer la suppression de ${produit.nom} ?`)) {
      try {
        await produitService.getById(produit.id);
        fetchProduits();
      } catch (err: any) {
        alert("Erreur lors de la suppression.");
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Produits</h1>
        <Button
          onClick={() => openForm()}
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition"
        >
          + Ajouter un produit
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500 py-10 animate-pulse">
            Chargement des produits..
          </div>
        ) : (
          <ProduitTable
            data={filteredProduit}
            onEdit={(produit) => openForm(produit.id)}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Drawer
        isOpen={drawerType === "formProduit"}
        onClose={closeDrawer}
        title={selectedProduitId ? "Modifier le produit" : "Créer un produit"}
      >
        <ProduitForm
          id={selectedProduitId ?? undefined}
          onSuccess={() => {
            closeDrawer();
            fetchProduits();
          }}
        />
      </Drawer>
    </div>
  );
}