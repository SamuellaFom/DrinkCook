import { MRT_ColumnDef } from "material-react-table";
import {CommandeClient, StatutCommandeClient} from "../../../api/frontOffice/commandeClientService";

const PREVIEW_DISCOUNT_EUR = 5;

export function columnsCommandeClient(): MRT_ColumnDef<CommandeClient>[] {
    return [
        {
            accessorKey: "dateCommande",
            header: "Date",
            size: 220,
            muiTableBodyCellProps: { className: "text-gray-800 whitespace-nowrap" },
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold" },
            Cell: ({ row }) => (
                <span className="font-medium">
          {new Date(row.original.dateCommande).toLocaleString("fr-FR")}
        </span>
            ),
        },
        {
            accessorKey: "client.nom",
            header: "Client",
            size: 260,
            muiTableBodyCellProps: { className: "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px]" },
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold" },
            Cell: ({ row }) => {
                const client = row.original.client;
                return client ? (
                    <span>{client.nom} {client.email ? `(${client.email})` : ""}</span>
                ) : (
                    <span className="text-gray-400 italic">Guest</span>
                );
            },
        },
        {
            accessorKey: "montantTotal",
            header: "Total",
            size: 120,
            muiTableBodyCellProps: { className: "text-gray-800 whitespace-nowrap" },
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold" },
            Cell: ({ row }) => {
                const r = row.original;
                const statut: StatutCommandeClient = r.statut;
                const isPaid = statut === "payee" || statut === "livree";
                const isPending = statut === "en_attente";

                const brut = Number(r.montantTotal ?? 0);
                const net = r.montantNet != null ? Number(r.montantNet) : null;
                const remise = r.remiseFidelite != null ? Number(r.remiseFidelite) : 0;

                const wantPreview = isPending && (r.utiliserPointsFidelite === true || r.utiliserPointsFidelite === 1);
                const previewNet = Math.max(0, brut - PREVIEW_DISCOUNT_EUR);

                const amountToShow = isPaid ? (net ?? brut) : wantPreview ? previewNet : brut;

                return (
                    <div className="flex flex-col items-end">
                        <span className="font-semibold">{amountToShow.toFixed(2)} €</span>
                        {isPaid && remise > 0 && (
                            <span className="text-[11px] text-gray-500">(-{remise.toFixed(2)} € fidélité)</span>
                        )}
                        {!isPaid && wantPreview && (
                            <span className="text-[11px] text-gray-500">(-{PREVIEW_DISCOUNT_EUR.toFixed(2)} € fidélité)</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "statut",
            header: "Statut",
            size: 140,
            muiTableBodyCellProps: { className: "text-gray-800 whitespace-nowrap" },
            muiTableHeadCellProps: { className: "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold" },
            Cell: ({ cell }) => {
                const statut = cell.getValue<StatutCommandeClient>();
                const map: Record<StatutCommandeClient, string> = {
                    en_attente: "bg-yellow-100 text-yellow-800",
                    payee: "bg-green-100 text-green-800",
                    livree: "bg-blue-100 text-blue-800",
                    annulee: "bg-red-100 text-red-800",
                };
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[statut] || ""}`}>
            {statut}
          </span>
                );
            },
        },
    ];
}
