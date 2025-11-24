import axios from 'axios';
import { Camion } from "../../assets/ts/interfaces";
import { handleError } from './franchiseService';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/back-office/camions`;

export const camionService = {
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

  getInfosCamions: async () => {
    try {
      const res = await axios.get(`${ENDPOINT}/list`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getInfosEmplacements: async () => {
    try {
      const res = await axios.get(`${ENDPOINT}/emplacements/`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  createEmplacement: async (data: any) => {
    try {
      const res = await axios.post(`${ENDPOINT}/emplacements/assign`, data);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  create: async (data: any) => {
    try {
      const res = await axios.post<Camion>(ENDPOINT, data);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  update: async (id: number, data: any) => {
    try {
      const res = await axios.patch<Camion>(`${ENDPOINT}/${id}`, data);
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