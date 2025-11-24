import axios from "axios";
import { handleError } from "../backOffice/franchiseService";
import {Produit} from "../../assets/ts/interfaces";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ENDPOINT = `${BASE_URL}/front-office/article-prix`;

export type ArticlePrixRow = {
    id: string;
    nom: string;
    description?: string;
    category?: { id: number; nom: string } | null;
    stockDispo: number;
    basePrice: number;
    prix: number;
    actif: boolean;
};

export type ArticlePrixSearchParams = {
    q?: string;
    categoryId?: number;
    inStockOnly?: boolean;
    actifsOnly?: boolean;
};

export const articlePrixFranchiseService = {
    list: async (params?: {
        q?: string;
        categoryId?: number;
        inStockOnly?: boolean;
        actifsOnly?: boolean;
    }): Promise<ArticlePrixRow[]> => {
        try {
            const res = await axios.get<{ success: boolean; data: ArticlePrixRow[] }>(
                `${ENDPOINT}/`,
                { withCredentials: true, params }
            );
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },

    upsert: async (
        produitId: string,
        payload: { actif?: boolean; prix_vente?: number | null }
    ) => {
        try {
            const res = await axios.put<{ success: boolean; data: any }>(
                `${ENDPOINT}/${produitId}`,
                payload,
                { withCredentials: true }
            );
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },


    search: async (params: ArticlePrixSearchParams = {}): Promise<Produit[]> => {
        try {
            const res = await axios.get<{ success: boolean; data: Produit[] }>(ENDPOINT, {
                withCredentials: true,
                params: {
                    q: params.q,
                    categoryId: params.categoryId,
                    inStockOnly: params.inStockOnly ?? false,
                    actifsOnly: params.actifsOnly ?? true,
                },
            });
            return res.data.data;
        } catch (err) {
            throw handleError(err);
        }
    },





};
