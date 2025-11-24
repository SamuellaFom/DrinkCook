import axios from "axios";
import { Entretien } from "../../assets/ts/interfaces";
import { handleError } from "./franchiseService";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/back-office/entretiens`;

export const entretienService = {
  getAll: async () => {
    try {
      const res = await axios.get(`${ENDPOINT}/`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getById: async (id: number) => {
    try {
      const res = await axios.get(`${ENDPOINT}/${id}`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  create: async (data: any) => {
    try {
      const res = await axios.post<Entretien>(ENDPOINT, data);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  update: async (id: number, data: any) => {
    try {
      const res = await axios.patch<Entretien>(`${ENDPOINT}/${id}`, data);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  /* delete: async (id: string) => {
    try {
      await axios.delete(`${ENDPOINT}/${id}`);
      return true;
    } catch (err) {
      throw handleError(err);
    }
  }, */
}