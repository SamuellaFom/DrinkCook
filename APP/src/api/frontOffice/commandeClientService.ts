import axios from "axios";
import { handleError } from "../backOffice/franchiseService";

export type StatutCommandeClient = "en_attente" | "payee" | "livree" | "annulee";

export type CommandeClientLigneProduit = {
    id?: string;
    produit?: { id: string; nom?: string };
    produitId?: string;
    quantite: number;
    prixUnitaire?: number;
};

export type CommandeClientLigneMenu = {
    id?: string;
    menu?: { id: string; nom?: string };
    menuId?: string;
    quantite: number;
    prixUnitaire?: number;
};

export type CommandeClient = {
    id: string;
    dateCommande: string;
    statut: StatutCommandeClient;
    montantTotal: number;
    utiliserPointsFidelite?: boolean | number;
    montantNet?: number | null;
    remiseFidelite?: number | null;
    client?: { id: string; nom: string; email?: string } | null;
    franchise?: { id: string; nom?: string };
    lignes?: CommandeClientLigneProduit[];
    menus?: CommandeClientLigneMenu[];
    vente?: { id: string; dateVente: string; remiseFidelite: number; montantNet: number } | null;
};

export type CreateCommandeClientPayload = {
    clientId?: string | null;
    lignes?: { produitId: string; quantite: number }[];
    menus?: { menuId: string; quantite: number }[];
    utiliserPointsFidelite?: boolean;
};

export type ListCommandeClientsParams = {
    page?: number;
    limit?: number;
    statut?: StatutCommandeClient;
    from?: string;
    to?: string;
};

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/commandes-clients`;

export const commandeClientService = {
    create: async (payload: CreateCommandeClientPayload): Promise<CommandeClient> => {
        try {
            const res = await axios.post<{ success: boolean; data: CommandeClient }>(
                `${ENDPOINT}`,
                payload,
                { withCredentials: true }
            );
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },

    list: async (params?: ListCommandeClientsParams): Promise<CommandeClient[]> => {
        try {
            const res = await axios.get<{ success: boolean; data: CommandeClient[] }>(
                `${ENDPOINT}/`,
                { withCredentials: true, params }
            );
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },

    getById: async (id: string): Promise<CommandeClient> => {
        try {
            const res = await axios.get<{ success: boolean; data: CommandeClient }>(
                `${ENDPOINT}/${id}`,
                { withCredentials: true }
            );
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },

    pay: async (id: string, body?: { utiliserPoints?: boolean }): Promise<CommandeClient> => {
        try {
            const res = await axios.post<{ success: boolean; data: CommandeClient }>(
                `${ENDPOINT}/${id}/payer`,
                body ?? {},
                { withCredentials: true }
            );
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },

    cancel: async (id: string): Promise<CommandeClient> => {
        try {
            const res = await axios.post<{ success: boolean; data: CommandeClient }>(
                `${ENDPOINT}/${id}/annuler`,
                {},
                { withCredentials: true }
            );
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },
};
