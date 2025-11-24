import { MRT_ColumnDef } from "material-react-table";
import {StockItem} from "../../../assets/ts/FranchiseInterface";

export function columnsStock(seuilBas = 10): MRT_ColumnDef<StockItem>[] {
    return [
        {
            accessorKey: "produit.nom",
            header: "Produit",
            size: 280,
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold" },
            muiTableBodyCellProps: { className: "whitespace-nowrap font-medium text-gray-900" },
            Cell: ({ row }) => {
                const p = row.original.produit;
                return (
                    <div className="flex flex-col">
                    <span className="font-semibold">{p.nom}</span>
                {p?.category?.nom && <span className="text-xs text-gray-500">{p.category.nom}</span>}
                    </div>
                );
                },
            },
        {
            accessorKey: "quantite",
            header: "Qté",
            size: 100,
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold" },
            Cell: ({ row }) => <span className="font-semibold">{row.original.quantite}</span>,
        },
        {
            id: "etat",
            header: "État",
            size: 140,
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold" },
            Cell: ({ row }) => {
                const q = Number(row.original.quantite);
                const seuilProduit = typeof row.original.produit.seuil === "number"
                    ? Number(row.original.produit.seuil)
                    : seuilBas;

                let label = "Disponible";
                let cls = "bg-green-100 text-green-800";
                if (q === 0) { label = "Rupture"; cls = "bg-red-100 text-red-800"; }
                else if (q <= seuilProduit) { label = "Faible"; cls = "bg-yellow-100 text-yellow-800"; }

                return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>{label}</span>;
            },
        },


        {
          accessorKey: "produit.seuil",
          header: "Seuil",
          size: 90,
          muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold" },
          Cell: ({ row }) => <span>{row.original.produit.seuil ?? "—"}</span>,
        },



    ];
}
