import { MRT_ColumnDef } from "material-react-table";
import { Camion } from "../../../assets/ts/interfaces";
import { useNavigate } from "react-router-dom";

export function columnsCamion(): MRT_ColumnDef<Camion>[] {
  return [
    {
      accessorKey: "immatriculation",
      header: "Immatriculation",
      size: 220,
      muiTableBodyCellProps: {
        sx: {
          fontWeight: "600",
          color: "#1F2937",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 280,
        },
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide text-xs font-bold",
      },
    },
    {
      accessorKey: "kilometrage",
      header: "Kilometrage",
      size: 280,
      muiTableBodyCellProps: {
        className:
          "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      size: 280,
      muiTableBodyCellProps: {
        className:
          "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
      },
      Cell: ({ cell }) => {
        const statut = cell.getValue<
          "disponible" | "en_reparation" | "en_mission" | "hors_service"
        >();

        const colors: Record<typeof statut, string> = {
          disponible:
            "bg-green-100 text-green-800 ring-1 ring-green-300 hover:bg-green-200 transition duration-300",
          en_reparation:
            "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300 hover:bg-yellow-200 transition duration-300",
          en_mission:
            "bg-blue-100 text-blue-800 ring-1 ring-blue-300 hover:bg-blue-200 transition duration-300",
          hors_service:
            "bg-gray-100 text-gray-600 ring-1 ring-gray-300 hover:bg-gray-200 transition duration-300",
        };

        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold select-none cursor-default ${colors[statut]}`}
            style={{ minWidth: 100, userSelect: "none" }}
            title={statut.replace("_", " ").toUpperCase()}
          >
            {statut.replace("_", " ").toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: "franchise.nom",
      header: "Franchise",
      size: 280,
      muiTableBodyCellProps: {
        className:
          "text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]",
      },
      muiTableHeadCellProps: {
        className:
          "bg-gray-50 text-gray-700 uppercase tracking-wide font-semibold",
      },
      Cell: ({ row }) => {
        const navigate = useNavigate();
        const franchise = row.original.franchise;
        return (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a
            onClick={() =>
              navigate(`/franchises/${franchise.id}`)
            }
            className="text-blue-600 underline font-bold"
          >
            {franchise.nom}
          </a>
        );
      },
    },
  ];
}