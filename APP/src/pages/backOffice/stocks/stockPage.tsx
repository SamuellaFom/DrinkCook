import React, { useState, useEffect } from "react";
import { stockService } from "../../../api/backOffice/stockService";
import { franchiseService } from "../../../api/backOffice/franchiseService";
import { commandeStockService } from "../../../api/backOffice/commandeStockService";
import { Stock, Franchise } from "../../../assets/ts/interfaces";

export default function MainStocks() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selected, setSelected] = useState<Franchise | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [totalHistoryPages, setTotalHistoryPages] = useState(1);

  const [franchiseSearch, setFranchiseSearch] = useState("");
  const [franchiseStatus, setFranchiseStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [productSearch, setProductSearch] = useState("");
  const [rowsPage, setRowsPage] = useState(1);
  const [rowsSize, setRowsSize] = useState(10);
  const [tab, setTab] = useState<"stock" | "history">("stock");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchFranchises() {
      try {
        const params = new URLSearchParams({
          search: franchiseSearch,
          status: franchiseStatus,
          page: page.toString(),
          limit: pageSize.toString(),
          pagination: "true",
        });
        const res = await franchiseService.getInfos(params);
        setFranchises(res);
        if (!selected && res.length > 0) setSelected(res[0]);
      } catch (error) {
        console.error("Erreur fetch franchises", error);
      }
    }
    fetchFranchises();
  }, [franchiseSearch, franchiseStatus, page, pageSize, selected]);

  useEffect(() => {
    async function fetchStocks() {
      if (!selected) return;
      const params = new URLSearchParams({
        franchiseId: selected.id,
        search: productSearch,
        page: rowsPage.toString(),
        limit: rowsSize.toString(),
      });
      const res = await stockService.getAll(params);
      setStocks(res);
    }
    fetchStocks();
  }, [selected, productSearch, rowsPage, rowsSize]);

  useEffect(() => {
    async function fetchHistory() {
      if (!selected) return;
      const params = new URLSearchParams({
        franchiseId: selected.id,
        page: rowsPage.toString(),
        size: rowsSize.toString(),
        startDate,
        endDate,
      });
      const res = await commandeStockService.getAll(params);
      setHistory(res.data);
      setTotalHistoryPages(Math.max(1, Math.ceil(res.total / rowsSize)));
    }
    fetchHistory();
  }, [selected, rowsPage, rowsSize, startDate, endDate]);

  const handleSelectFranchise = (f: Franchise) => {
    setSelected(f);
    setRowsPage(1);
    setProductSearch("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 pb-12 pt-16">
      <section>
        <div className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row md:items-end md:justify-center gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-medium text-gray-500 mb-1 text-center md:text-left">
              Rechercher une franchise
            </label>
            <input
              type="text"
              value={franchiseSearch}
              onChange={(e) => {
                setFranchiseSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Nom, ville…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full md:w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1 text-center md:text-left">
              Filtrer par statut
            </label>
            <select
              value={franchiseStatus}
              onChange={(e) => {
                setFranchiseStatus(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
        <aside className="bg-white rounded-xl shadow-md flex flex-col">
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-gray-700">Franchises</h3>
            <p className="text-xs text-gray-400">
              Sélectionnez pour voir le stock
            </p>
          </div>

          <div
            className="overflow-y-auto flex-1"
            style={{ maxHeight: "calc(100vh - 16rem)" }}
          >
            {franchises.map((f) => (
              <button
                key={f.id}
                onClick={() => handleSelectFranchise(f)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors duration-150 ${
                  selected?.id === f.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-700">{f.nom}</div>
                    <div className="text-xs text-gray-400">
                      {f.ville || "N/A"}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      f.statut === "inactive"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {f.statut === "inactive" ? "Inactif" : "OK"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t flex items-center justify-between text-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-md border text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Préc.
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(franchises.length / pageSize)}
                className="px-3 py-1 rounded-md border text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Suiv.
              </button>
            </div>
            <div className="text-xs text-gray-400">
              Page {page} /{" "}
              {Math.max(1, Math.ceil(franchises.length / pageSize))}
            </div>
          </div>
        </aside>

        {selected && (
          <section className="bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {selected.nom}
              </h2>
              <span className="text-sm text-gray-500">
                {selected.ville || "Ville inconnue"}
              </span>
            </div>

            <div className="px-5 pt-3 border-b">
              <div className="flex gap-6 text-sm">
                <button
                  onClick={() => setTab("stock")}
                  className={`py-2 border-b-2 ${
                    tab === "stock"
                      ? "border-blue-600 text-blue-700 font-semibold"
                      : "border-transparent hover:text-blue-700"
                  } transition-colors duration-150`}
                >
                  Stock
                </button>
                <button
                  onClick={() => setTab("history")}
                  className={`py-2 border-b-2 ${
                    tab === "history"
                      ? "border-blue-600 text-blue-700 font-semibold"
                      : "border-transparent hover:text-blue-700"
                  } transition-colors duration-150`}
                >
                  Réceptions
                </button>
              </div>
            </div>

            {tab === "stock" && (
              <div className="px-5 py-3 flex-1 flex flex-col overflow-hidden">
                <div className="flex flex-wrap gap-4 items-end mb-4">
                  <div className="w-full md:w-1/3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Rechercher produit
                    </label>
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setRowsPage(1);
                      }}
                      placeholder="Nom…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border rounded-lg overflow-auto flex-1">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead className="bg-blue-50 text-blue-700">
                      <tr>
                        <th className="p-3 text-left font-medium">Produit</th>
                        <th className="p-3 text-right font-medium">Quantité</th>
                        <th className="p-3 text-right font-medium">
                          Catégorie
                        </th>
                        <th className="p-3 text-right font-medium">Actif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map((item) => {
                        const isCritical = item.quantite <= item.produit.seuil;
                        return (
                          <tr
                            key={item.id}
                            className={`border-b hover:bg-gray-50 ${
                              isCritical ? "bg-red-50" : "bg-white"
                            }`}
                          >
                            <td className="p-3">{item.produit.nom}</td>
                            <td
                              className={`p-3 text-right font-semibold ${
                                isCritical ? "text-red-600" : "text-gray-700"
                              }`}
                            >
                              {item.quantite}
                            </td>
                            <td className="p-3 text-right">
                              {item.produit.category.nom}
                            </td>
                            <td className="p-3 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  item.produit.actif
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {item.produit.actif ? "Oui" : "Non"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "history" && (
              <div className="px-5 pb-5 pt-3 flex flex-col flex-1">
                <div className="flex flex-wrap gap-4 items-end mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Date début
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setRowsPage(1);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Date fin
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setRowsPage(1);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                  <div
                    className="overflow-auto flex-1"
                    style={{ maxHeight: "calc(100vh - 22rem)" }}
                  >
                    <table className="w-full text-sm min-w-[700px]">
                      <thead className="bg-gray-50 sticky top-0 text-gray-600 z-10">
                        <tr className="border-b">
                          <th className="p-3 text-left">Commande</th>
                          <th className="p-3 text-left">Date</th>
                          <th className="p-3 text-left">Entrepôt</th>
                          <th className="p-3 text-left">Statut</th>
                          <th className="p-3 text-left">Produits</th>
                          <th className="p-3 text-right">Montant (€)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((commande) => {
                          const date = new Date(
                            commande.date_commande
                          ).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          const statutLabel = commande.statut
                            ? commande.statut
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c: string) =>
                                  c.toUpperCase()
                                )
                            : "—";

                          const statutClasses =
                            commande.statut === "valide"
                              ? "bg-emerald-100 text-emerald-700"
                              : commande.statut === "livree"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700";

                          return (
                            <tr
                              key={commande.id}
                              className="border-b hover:bg-gray-50 align-top"
                            >
                              <td className="p-3 font-medium">
                                {commande.id_formatted}
                              </td>
                              <td className="p-3">{date}</td>
                              <td className="p-3">
                                {commande.entrepot?.nom || "E_EXTERNE"}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statutClasses}`}
                                >
                                  {statutLabel}
                                </span>
                              </td>
                              <td className="p-3">
                                {commande.produits?.length > 0 ? (
                                  <ul className="space-y-1">
                                    {commande.produits
                                      .slice(0, 2)
                                      .map((p: any, idx: number) => (
                                        <li
                                          key={idx}
                                          className="flex justify-between"
                                        >
                                          <span>{p.produit?.nom}</span>
                                          <span className="text-gray-600 font-medium">
                                            x{p.quantite}
                                          </span>
                                        </li>
                                      ))}
                                    {commande.produits.length > 2 && (
                                      <li className="text-blue-500 text-xs cursor-pointer hover:underline">
                                        Voir plus…
                                      </li>
                                    )}
                                  </ul>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {commande.montant_total
                                  ? `${Number(commande.montant_total).toFixed(
                                      2
                                    )} €`
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 border-t flex items-center justify-between text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRowsPage((p) => Math.max(1, p - 1))}
                        disabled={rowsPage <= 1}
                        className="px-3 py-1 rounded-md border text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Préc.
                      </button>
                      <button
                        onClick={() =>
                          setRowsPage((p) => Math.min(totalHistoryPages, p + 1))
                        }
                        disabled={rowsPage >= totalHistoryPages}
                        className="px-3 py-1 rounded-md border text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Suiv.
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      Page {rowsPage} / {totalHistoryPages}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}