import axios from "axios";
import {handleError} from "../backOffice/franchiseService";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/entrepots`;

export type EntrepotLite = { id: number; nom: string };

export const entrepotService = {
    list: async (): Promise<EntrepotLite[]> => {
        try {
            const res = await axios.get<{ success?: boolean; data: EntrepotLite[] }>(`${ENDPOINT}/`, {
                withCredentials: true,
            });
            return (res.data as any).data ?? res.data;
        } catch (err) {
            throw handleError(err);
        }
    },
};
