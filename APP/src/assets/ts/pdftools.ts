import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateAllFranchisesPDF(franchises: any[], startDate: string, endDate: string) {

  const doc = new jsPDF();

  const dateS = startDate ? new Date(startDate).toLocaleDateString("fr-FR") : "?";
  const dateE = endDate ? new Date(endDate).toLocaleDateString("fr-FR") : "?";

  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(`Rapport global des franchises`, 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text(`Période : ${dateS} - ${dateE}`, 14, 28);

  const rows = franchises.map((f) => [
    f.nom,
    f.ville,
    f.employes,
    f.camion,
    `${f.ca.toFixed(2)} €`,
    f.commandes,
    f.statut,
  ]);

  autoTable(doc, {
    startY: 35,
    head: [["Nom", "Ville", "Employés", "Camion", "Chiffre d'affaires", "Commandes", "Statut"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }, 
    alternateRowStyles: { fillColor: [240, 240, 240] },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  doc.save("Rapport_Toutes_Franchises.pdf");
}

export function generateFranchisePDF(franchise: any, startDate: string, endDate: string) {
  const doc = new jsPDF();

  const dateS = startDate ? new Date(startDate).toLocaleDateString("fr-FR") : "?";
  const dateE = endDate ? new Date(endDate).toLocaleDateString("fr-FR") : "?";


  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text(`Rapport Complet - ${franchise.nom || "Franchise"}`, 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(66, 66, 66);
  doc.text(`Période : ${dateS} - ${dateE}`, 14, 28);

  let yPosition = 35;

  doc.setFontSize(10);
  doc.setTextColor(52, 152, 219);
  doc.text("INFOS FRANCHISE", 14, yPosition);
  yPosition += 2;

  autoTable(doc, {
    startY: yPosition,
    head: [["Nom", "Ville", "SIRET", "Statut"]],
    body: [[franchise.nom || "-", franchise.ville || "-", franchise.siret || "-", franchise.statut || "-"]],
    theme: "grid",
    headStyles: { fillColor: [52, 152, 219], textColor: 255 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(46, 204, 113);
  doc.text("RÉSUMÉ CHIFFRES", 14, yPosition);

  const ca = franchise.ventes?.reduce((sum: number, v: any) => sum + parseFloat(v.montant || 0), 0) || 0;
  const nbCommandes = franchise.commandesStocks?.length || 0;
  const nbEmployes = franchise.users?.length || 0;
  const nbProduits = franchise.stocks?.length || 0;

  autoTable(doc, {
    startY: yPosition + 2,
    head: [["Chiffre d'affaires (€)", "Nb Commandes", "Nb Employés", "Nb Produits"]],
    body: [[ca.toFixed(2), nbCommandes, nbEmployes, nbProduits]],
    theme: "grid",
    headStyles: { fillColor: [46, 204, 113], textColor: 255 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(39, 174, 96);
  doc.text("LISTE DES VENTES", 14, yPosition);

  const ventes = (franchise.ventes || []).map((v: any) => [
    new Date(v.dateVente).toLocaleDateString("fr-FR"),
    `${parseFloat(v.montant || 0).toFixed(2)} €`
  ]);

  autoTable(doc, {
    startY: yPosition + 2,
    head: [["Date de Vente", "Montant (€)"]],
    body: ventes,
    theme: "striped",
    headStyles: { fillColor: [39, 174, 96], textColor: 255 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(231, 76, 60);
  doc.text("COMMANDES FOURNISSEUR", 14, yPosition);

  const commandes = (franchise.commandesStocks || []).map((c: any) => [
    new Date(c.date_commande).toLocaleDateString("fr-FR"),
    c.entrepot?.nom || "E_EXTERNE",
    c.statut || "-",
    `${parseFloat(c.montant_total || 0).toFixed(2)} €`
  ]);

  autoTable(doc, {
    startY: yPosition + 2,
    head: [["Date", "Entrepôt", "Statut", "Montant (€)"]],
    body: commandes,
    theme: "striped",
    headStyles: { fillColor: [231, 76, 60], textColor: 255 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(155, 89, 182);
  doc.text("EMPLOYÉS", 14, yPosition);

  const employes = (franchise.users || []).map((u: any) => [
    u.username || "-",
    u.email || "-",
    u.role?.type || "-"
  ]);

  autoTable(doc, {
    startY: yPosition + 2,
    head: [["Nom", "Email", "Rôle"]],
    body: employes,
    theme: "grid",
    headStyles: { fillColor: [155, 89, 182], textColor: 255 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(241, 196, 15);
  doc.text("CAMION", 14, yPosition);

  const camion = franchise.camion
    ? [[franchise.camion.immatriculation || "-", franchise.camion.statut || "-", franchise.camion.kilometrage || "-", new Date(franchise.camion.date_achat).toLocaleDateString("fr-FR") || "-"]]
    : [["-", "-", "-", "-"]];

  autoTable(doc, {
    startY: yPosition + 2,
    head: [["Immatriculation", "Statut", "Kilometrage", "Date d'achat"]],
    body: camion,
    theme: "grid",
    headStyles: { fillColor: [241, 196, 15], textColor: 0 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(230, 126, 34);
  doc.text("STOCK PRODUITS", 14, yPosition);

  const stocks = (franchise.stocks || []).map((s: any) => [
    s.produit?.nom || "-",
    s.quantite ?? "-",
    `${parseFloat(s.produit?.prix || 0).toFixed(2)} €`
  ]);

  autoTable(doc, {
    startY: yPosition + 2,
    head: [["Produit", "Quantité", "Prix Unitaire (€)"]],
    body: stocks,
    theme: "grid",
    headStyles: { fillColor: [230, 126, 34], textColor: 255 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Rapport généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, yPosition);

  doc.save(`Rapport_${franchise.nom || "franchise"}.pdf`);
}