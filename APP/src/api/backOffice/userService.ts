import axios from 'axios';
import { User } from '../../assets/ts/interfaces';
import { handleError } from './franchiseService';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/back-office/users`;

export const userService = {
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

  getInfosRole: async () => {
    try {
      const res = await axios.get(`${BASE_URL}/back-office/roles/list`);
      return res.data.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  create: async (data: any) => {
    try {
      const res = await axios.post<User>(ENDPOINT, data);
      return res.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  update: async (id: string, data: any) => {
    try {
      const res = await axios.patch<User>(`${ENDPOINT}/${id}`, data);
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