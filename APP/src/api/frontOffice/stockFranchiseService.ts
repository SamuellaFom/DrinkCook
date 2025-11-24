import axios from "axios";
import { handleError } from "../backOffice/franchiseService";
import {StockItem, StockListParams} from "../../assets/ts/FranchiseInterface";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/stocks`;



export const stockFranchiseService = {
    list: async (params?: StockListParams): Promise<StockItem[]> => {
        try {
            const res = await axios.get<{ success: boolean; data: StockItem[] }>(
                `${ENDPOINT}/`,
                { withCredentials: true, params }
            );
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },
};
