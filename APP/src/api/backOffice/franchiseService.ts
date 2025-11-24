import axios, { AxiosError } from 'axios';
import { Franchise } from '../../assets/ts/interfaces';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/back-office/franchises`;

interface ApiError {
  message: string;
  status?: number;
}

export const handleError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      message:
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Erreur réseau inconnue',
      status: axiosError.response?.status,
    };
  }

  return {
    message: 'Une erreur inattendue est survenue',
  };
};

export const franchiseService = {
  getAll: async () => {
    try {
      const res = await axios.get(`${ENDPOINT}/`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getById: async (id: string) => {
    try {
      const res = await axios.get(`${ENDPOINT}/${id}`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getInfos: async (params?: any) => {
    try {
      const query = params ? `?${params.toString()}` : "";
      const res = await axios.get(`${ENDPOINT}/list${query}`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getAllReport: async (params?: any) => {
    try {
      const query = params ? `?${params.toString()}` : "";
      const res = await axios.get(`${ENDPOINT}/reports/${query}`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getReport: async (id: string, params?: any) => {
    try {
      const query = params ? `?${params.toString()}` : "";
      const res = await axios.get(`${ENDPOINT}/reports/${id}${query}`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  create: async (data: any) => {
    try {
      const res = await axios.post<Franchise>(ENDPOINT, data);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  update: async (id: string, data: any) => {
    try {
      const res = await axios.patch<Franchise>(`${ENDPOINT}/${id}`, data);
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
};