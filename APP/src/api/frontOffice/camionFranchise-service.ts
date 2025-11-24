import axios from "axios";
import { Camion, Panne } from "../../assets/ts/interfaces";
import { handleError } from "../backOffice/franchiseService";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/camions`;

export const camionFranchiseService = {
    getMine: async (): Promise<Camion> => {
        try {
            const res = await axios.get(`${ENDPOINT}/camion`, { withCredentials: true });
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    declarePanne: async (
        camionId: number,
        data: { date_panne: string; description: string }
    ): Promise<Panne> => {
        try {
            const res = await axios.post<Panne>(`${ENDPOINT}/${camionId}/pannes`, data, { withCredentials: true });
            return res.data;
        } catch (err) {
            throw handleError(err);
        }
    },
};
