import axios from 'axios';
import { Stock } from '../../assets/ts/interfaces';
import { handleError } from './franchiseService';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/back-office/stocks`;

export const stockService = {
  getAll: async (params: any) => {
    try {
      const query = params ? `?${params.toString()}` : "";
      const res = await axios.get(`${ENDPOINT}/${query}`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  /* getById: async (id: number) => {
    try {
      const res = await axios.get(`${ENDPOINT}/${id}`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getInfosCamions: async () => {
    try {
      const res = await axios.get(`${BASE_URL}/camions/list`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  }, */

  /* create: async (data: any) => {
    try {
      const res = await axios.post<Camion>(ENDPOINT, data);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  }, */

  /* update: async (id: number, data: any) => {
    try {
      const res = await axios.patch<S>(`${ENDPOINT}/${id}`, data);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  }, */

  /* delete: async (id: string) => {
    try {
      await axios.delete(`${ENDPOINT}/${id}`);
      return true;
    } catch (err) {
      throw handleError(err);
    }
  }, */
};