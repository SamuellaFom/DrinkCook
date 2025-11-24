import axios from 'axios';
import {handleError} from "../backOffice/franchiseService";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/search-produits`;


export const produitFranchiseService = {

    search: async (params: { q?: string; categoryId?: number }) => {
        try {
            const res = await axios.get(`${ENDPOINT}/search`, {params, withCredentials: true,});
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },


    getCategory: async () => {
        try {
            const res = await axios.get(`${BASE_URL}/front-office/categories`, {
                withCredentials: true,
                });
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },


}