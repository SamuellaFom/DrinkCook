import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../../../components/basics/Button";
import Drawer from "../../../components/basics/Drawer";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { menuService, MenuRow } from "../../../api/frontOffice/menuService";
import MenuFormDrawer from "./MenuFormDrawer";
import MenuDetailsDrawer from "./MenuDetailsDrawer";

export default function MenusPage() {
    const [rows, setRows] = useState<MenuRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const formId = searchParams.get("menuForm");
    const detailsId = searchParams.get("menuDetails");

    const isFormOpen = !!formId;
    const isDetailsOpen = !!detailsId;

    const load = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const data = await menuService.list();
            setRows(data);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => setSearchParams({ menuForm: "new" });
    const openEdit = (id: string) => setSearchParams({ menuForm: id });
    const openView = (id: string) => setSearchParams({ menuDetails: id });

    const closeForm = () => {
        const p = new URLSearchParams(searchParams);
        p.delete("menuForm");
        setSearchParams(p);
    };
    const closeDetails = () => {
        const p = new URLSearchParams(searchParams);
        p.delete("menuDetails");
        setSearchParams(p);
    };

    const table = useMaterialReactTable<MenuRow>({
        columns: [
            { accessorKey: "nom", header: "Nom", size: 220 },
            { accessorKey: "prix", header: "Prix", size: 100, Cell: ({ cell }) => `${Number(cell.getValue<number>()).toFixed(2)} €` },
            { accessorKey: "actif", header: "Actif", size: 80, Cell: ({ cell }) => (cell.getValue<boolean>() ? "Oui" : "Non") },
        ],
        data: rows,
        initialState: { density: "compact" },
        enableGlobalFilter: false,
        enableRowActions: true,
        renderRowActions: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button className="bg-gray-700 text-white px-3 py-1 rounded" onClick={() => openView(row.original.id)}>
                    Voir
                </Button>
                <Button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => openEdit(row.original.id)}>
                    Modifier
                </Button>
            </div>
        ),
        renderEmptyRowsFallback: () => <div className="p-4 text-center">Aucun menu</div>,
    });

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Menus / Formules</h1>
                <Button className="bg-black text-white px-4 py-2 rounded" onClick={openCreate}>
                    + Créer un menu
                </Button>
            </div>

            {err && <div className="text-red-600">{err}</div>}
            {loading ? (
                <div className="text-gray-500">Chargement…</div>
            ) : (
                <MaterialReactTable table={table} />
            )}

            {}
            <Drawer isOpen={isDetailsOpen} onClose={closeDetails} title="Détails du menu">
                {isDetailsOpen && detailsId && <MenuDetailsDrawer id={detailsId} />}
            </Drawer>

            {}
            <Drawer
                isOpen={isFormOpen}
                onClose={closeForm}
                title={formId && formId !== "new" ? "Modifier le menu" : "Créer un menu"}
            >
                {isFormOpen && (
                    <MenuFormDrawer
                        id={formId && formId !== "new" ? formId : undefined}
                        onSuccess={() => {
                            closeForm();
                            load();
                        }}
                    />
                )}
            </Drawer>
        </div>
    );
}
