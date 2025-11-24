import axios from "axios";
import {handleError} from "../backOffice/franchiseService";
import {CommandeStock, Quota8020Preview, UpdateCommandeStock} from "../../assets/ts/FranchiseInterface";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/commandes-stocks`;


export const commandeStockService = {
    create: async (data: { entrepotId?: number | null; lignes: { produitId: string; quantite: number }[] }) => {
        try {
            const res = await axios.post<{ success: boolean; data: CommandeStock }>(ENDPOINT, data, { withCredentials: true });
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },



    list: async (params?: { page?: number; limit?: number; statut?: string; from?: string; to?: string }) => {
        try {
            const res = await axios.get<{ success: boolean; data: CommandeStock[] }>(`${ENDPOINT}/`, {
                withCredentials: true, params,
            });
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },


    getById: async (id: number) => {
        try {
            const res = await axios.get<{ success: boolean; data: CommandeStock }>(`${ENDPOINT}/${id}`, { withCredentials: true });
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },


    update: async (id: number, payload: UpdateCommandeStock): Promise<CommandeStock> => {
        try {
            const res = await axios.patch<{ success: boolean; data: CommandeStock }>(`${ENDPOINT}/${id}`, payload, { withCredentials: true });
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },

    submit: async (id: number) => {
        try {
            const res = await axios.post<{ success: boolean; data: CommandeStock }>(`${ENDPOINT}/${id}/soumettre`, {}, {
                withCredentials: true,
            });
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },


    receive: async (id: number) => {
        try {
            const res = await axios.post<{ success: boolean; data: CommandeStock }>(`${ENDPOINT}/${id}/receptionner`, {}, {
                withCredentials: true,
            });
            return res.data.data;
        } catch (err) { throw handleError(err); }
    },

    remove: async (id: number) => {
        try {
            await axios.delete(`${ENDPOINT}/${id}`, { withCredentials: true });
        } catch (err) { throw handleError(err); }
    },


    previewQuota8020: async ()=> {
        try {
            const res = await axios.get<{ success: boolean; data: Quota8020Preview }>(
                `${ENDPOINT}/80-20/preview`,
                { withCredentials: true }
            );
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },


}