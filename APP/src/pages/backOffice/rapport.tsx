import React, { useState, useEffect } from "react";
import { franchiseService } from "../../api/backOffice/franchiseService";
import { Franchise } from "../../assets/ts/interfaces";
import {
  generateAllFranchisesPDF,
  generateFranchisePDF,
} from "../../assets/ts/pdftools";

export default function RapportsPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const data = await franchiseService.getAll();
        setFranchises(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFranchises();
  }, []);

  const handleGenerateGlobalPDF = async () => {
    if (!startDate || !endDate) {
      alert("Veuillez sélectionner une période.");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      const data = await franchiseService.getAllReport(params);
      await generateAllFranchisesPDF(data, startDate, endDate);

      alert("PDF global généré !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFranchisePDF = async () => {
    if (!selectedFranchise || !startDate || !endDate) {
      alert("Veuillez sélectionner une franchise et une période.");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      const data = await franchiseService.getReport(selectedFranchise, params);
      await generateFranchisePDF(data, startDate, endDate);
      alert(`PDF pour la franchise ${selectedFranchise} généré !`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rapports</h1>
        <p className="text-gray-600 mt-1">
          Génération de rapports PDF par période et par franchise.
        </p>
      </header>

      <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Sélection période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Sélection franchise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Franchise
            </label>
            <select
              value={selectedFranchise}
              onChange={(e) => setSelectedFranchise(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <button
            onClick={handleGenerateGlobalPDF}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Générer PDF global
          </button>
          <button
            onClick={handleGenerateFranchisePDF}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Générer PDF franchise
          </button>
        </div>
      </section>

      <section className="mt-8 text-gray-500 text-sm">
        <p>
          ⚠️ Veillez à sélectionner une période valide pour générer les
          rapports.
        </p>
      </section>
    </div>
  );
}