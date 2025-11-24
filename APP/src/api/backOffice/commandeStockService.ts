import axios from "axios";
import { handleError } from "./franchiseService";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/back-office/commandes-stocks`;

export const commandeStockService = {
  getAll: async (params?: any) => {
    try {
      const query = params ? `?${params.toString()}` : "";
      const res = await axios.get(`${ENDPOINT}/${query}`);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getAllByStatus: async (params?: any) => {
    try {
      const query = params ? `?${params.toString()}` : "";
      const res = await axios.get(`${ENDPOINT}/status${query}`);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  updateByStatus: async (id: number, statut: string) => {
    try {
      const res = await axios.put(`${ENDPOINT}/status/${id}`, { statut: statut });
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  },
};