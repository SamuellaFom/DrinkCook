import { MRT_ColumnDef } from "material-react-table";
import { User } from "../../../assets/ts/interfaces";
import { useNavigate } from "react-router-dom";

export function columnsUser(): MRT_ColumnDef<User>[] {
  return [
    {
      accessorKey: "username",
      header: "Nom",
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
      accessorKey: "email",
      header: "Email",
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
    {
      accessorKey: "role.type",
      header: "Role",
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
  ];
}