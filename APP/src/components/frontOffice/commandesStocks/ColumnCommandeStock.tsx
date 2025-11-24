import {MRT_ColumnDef} from "material-react-table";
import {CommandeStock, StatutCommandeStock} from "../../../assets/ts/FranchiseInterface";


export function columnCommandesStock(): MRT_ColumnDef<CommandeStock>[] {
    const colorMap: Record<StatutCommandeStock, string> = {
        [StatutCommandeStock.EN_COURS]: "bg-yellow-100 text-yellow-800",
        [StatutCommandeStock.SOUMISE]: "bg-orange-100 text-orange-800",
        [StatutCommandeStock.VALIDE]: "bg-indigo-100 text-indigo-800",
        [StatutCommandeStock.LIVREE]: "bg-green-100 text-green-800",
        [StatutCommandeStock.ANNULEE]: "bg-red-100 text-red-800",

    }

    const labelMap: Record<StatutCommandeStock, string> = {
        [StatutCommandeStock.EN_COURS]: "Brouillon",
        [StatutCommandeStock.SOUMISE]: "Soumise",
        [StatutCommandeStock.VALIDE]: "Validée",
        [StatutCommandeStock.LIVREE]: "Réceptionnée",
        [StatutCommandeStock.ANNULEE]: "Annulée",
    };


    return [
        {
            accessorKey: "id_formatted",
            header: "N°",
            size: 140,
            muiTableHeadCellProps: {className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold"},
            muiTableBodyCellProps: {className: "whitespace-nowrap font-semibold text-gray-800"},
        },

        {
            accessorKey: "date_commande",
            header: "Date de commande",
            size: 200,
            muiTableHeadCellProps: {className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold"},
            Cell: ({row}) => (
                <span className="font-medium">
          {new Date(row.original.date_commande).toLocaleString("fr-FR")}
        </span>
            ),
        },

        {
            accessorKey: "date_reception",
            header: "Réception",
            size: 200,
            muiTableHeadCellProps: {
                className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold"
            },
            Cell: ({row}) => (
                <span className="font-medium">
            {row.original.date_reception
                ? new Date(row.original.date_reception).toLocaleString("fr-FR")
                : "-"}
        </span>
            ),
        },


        {
            accessorKey: "entrepot.nom",
            header: "Entrepôt",
            size: 220,
            Cell: ({row}) => (
                <span>{row.original.entrepot?.nom ?? "Achat externe"}</span>
            ),
        },

        {
            accessorKey: "montant_total",
            header: "Total",
            size: 120,
            muiTableHeadCellProps: {className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold"},
            Cell: ({row}) => (
                <span className="font-semibold">
          {Number(row.original.montant_total ?? 0).toFixed(2)} €
        </span>
            ),
        },

        {
            accessorKey: "statut",
            header: "Statut",
            size: 160,
            muiTableHeadCellProps: {className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold"},
            Cell: ({cell}) => {
                const statut = cell.getValue<StatutCommandeStock>();
                const badge = colorMap[statut] ?? "bg-gray-100 text-gray-700";
                const label = labelMap[statut] ?? String(statut);
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge}`}>
            {label}
          </span>
                );
            },
        },
    ];
}
