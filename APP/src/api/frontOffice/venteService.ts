import axios from "axios";
import {handleError} from "../backOffice/franchiseService";
import {Vente} from "../../assets/ts/FranchiseInterface";


const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/ventes`;

export const venteService = {
    list: async (params?: { from?: string; to?: string }) => {
        try {
            const res = await axios.get<{ success: boolean; data: Vente[]; meta: { total: number; count: number } }>(
                `${ENDPOINT}/`,
                { withCredentials: true, params }
            );
            return res.data
        } catch (err) {
            throw handleError(err);
        }
    },
};
