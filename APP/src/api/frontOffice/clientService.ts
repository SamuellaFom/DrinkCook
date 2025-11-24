import axios from "axios";
import {handleError} from "../backOffice/franchiseService";
import { Client } from "../../assets/ts/FranchiseInterface";



const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/clients`;

export const clientService = {


    create: async (data: any) => {
        try {
            const res = await axios.post<Client>(ENDPOINT, data, { withCredentials: true });
            return res.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    listClients: async (params?: { q?: string; page?: number; limit?: number; nom?: string; email?: string }) => {
        try {
            const res = await axios.get(`${ENDPOINT}/`, {
                withCredentials: true,
                params,
            });
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    getById: async (id: string) => {
        try {
            const res = await axios.get(`${ENDPOINT}/${id}`, { withCredentials: true });
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    update: async (id: string, data: any) => {
        try {
            const res = await axios.patch<{success: boolean; data: Client}>(`${ENDPOINT}/${id}`, data, { withCredentials: true });
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },


    getDetails: async (id: string) => {
        try {
            const res = await axios.get(`${ENDPOINT}/${id}/details`, { withCredentials: true });
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },


    delete: async (id: string) => {
        try {
            const res = await axios.delete<{ success: boolean; message: string }>(
                `${ENDPOINT}/${id}`,
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            throw handleError(err);
        }
    },


}
