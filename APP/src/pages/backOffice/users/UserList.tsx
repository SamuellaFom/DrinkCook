import { useEffect, useState, useCallback } from "react";
import { userService } from "../../../api/backOffice/userService";
import { User } from "../../../assets/ts/interfaces";
import Button from "../../../components/basics/Button";
import Drawer from "../../../components/basics/Drawer";
import UserTable from "../../../components/backOffice/users/UserTable";
import { useSearchParams } from "react-router-dom";
import UserForm from "./UserFomPage";

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerType, setDrawerType] = useState<"formUser" | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const formId = searchParams.get("formUser");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setFilteredUsers(data); 
      setError(null);
    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err?.message ?? "Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (formId) {
      setDrawerType("formUser");
      setSelectedUserId(formId === "new" ? null : formId);
    } else {
      setDrawerType(null);
      setSelectedUserId(null);
    }
  }, [formId]);

  const openForm = (id?: string) => {
    setSearchParams({ formUser: id ?? "new" });
  };

  const closeDrawer = () => {
    searchParams.delete("formUser");
    setSearchParams(searchParams);
  };

  const handleDelete = async (user: User) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Confirmer la suppression de ${user.username} ?`)) {
      try {
        await userService.getById(user.id);
        fetchUsers();
      } catch (err: any) {
        alert("Erreur lors de la suppression.");
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Utilisateurs</h1>
        <Button
          onClick={() => openForm()}
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition"
        >
          + Ajouter un utilisateur
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500 py-10 animate-pulse">
            Chargement des utilisateurs...
          </div>
        ) : (
          <UserTable
            data={filteredUsers}
            onEdit={(user) => openForm(user.id)}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Drawer
        isOpen={drawerType === "formUser"}
        onClose={closeDrawer}
        title={selectedUserId ? "Modifier l'utilisateur" : "Créer un utilisateur"}
      >
        <UserForm
          id={selectedUserId ?? undefined}
          onSuccess={() => {
            closeDrawer();
            fetchUsers();
          }}
        />
      </Drawer>
    </div>
  );
}