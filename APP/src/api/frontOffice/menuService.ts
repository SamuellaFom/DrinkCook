import axios from "axios";
import { handleError } from "../backOffice/franchiseService";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/menus`;

export type MenuLineInput = { produitId: string; quantite: number };

export type MenuRow = {
    id: string;
    nom: string;
    description: string | null;
    prix: number;
    actif: boolean;
    stockDispo: number;
    lignes: { produitId: string; produitNom: string; quantite: number }[];
};

export const menuService = {
    list: async (params?: {
        q?: string;
        actifsOnly?: boolean;
    }): Promise<MenuRow[]> => {
        try {
            const res = await axios.get<{ success: boolean; data: MenuRow[] }>(
                `${ENDPOINT}/`,
                { withCredentials: true, params }
            );
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    getById: async (id: string): Promise<any> => {
        try {
            const res = await axios.get<{ success: boolean; data: any }>(
                `${ENDPOINT}/${id}`,
                { withCredentials: true }
            );
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    create: async (payload: {
        nom: string;
        description?: string | null;
        prix: number;
        actif?: boolean;
        lignes: MenuLineInput[];
    }) => {
        try {
            const res = await axios.post<{ success: boolean; data: any }>(
                `${ENDPOINT}`,
                payload,
                { withCredentials: true }
            );
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    update: async (
        id: string,
        payload: Partial<{
            nom: string;
            description?: string | null;
            prix: number;
            actif: boolean;
            lignes: MenuLineInput[];
        }>
    ) => {
        try {
            const res = await axios.patch<{ success: boolean; data: any }>(
                `${ENDPOINT}/${id}`,
                payload,
                { withCredentials: true }
            );
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },
};
