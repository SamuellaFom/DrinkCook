import axios from 'axios';
import {handleError} from "../backOffice/franchiseService";
import {Evenement} from "../../assets/ts/FranchiseInterface";


const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/evenements`;



export const evenementService = {
    listEvenements: async (params?: { from?: string; to?: string; page?: number; limit?: number }) => {
        try {
            const res = await axios.get(`${ENDPOINT}/`, {
                withCredentials: true,});
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    create: async (data: any) => {
        try {
            const res = await axios.post<Evenement>(ENDPOINT, data, {
                withCredentials: true,});
            return res.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    update: async (id: string, data: any) => {
        try {
            const res = await axios.patch<Evenement>(`${ENDPOINT}/${id}`, data, {
                withCredentials: true,});
            return res.data;
        } catch (err) {
            throw handleError(err);
        }
    },


    getById: async (id: string) => {
        try {
            const res = await axios.get(`${ENDPOINT}/${id}`, {
                withCredentials: true,});
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },


    delete: async (id: string) => {
   try {
     await axios.delete(`${ENDPOINT}/${id}`, {
         withCredentials: true,});
     return true;
   } catch (err) {
     throw handleError(err);
   }
 },


}