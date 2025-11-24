export interface Client {
    id: string;
    nom: string;
    email: string;
    telephone?: string | null;
    createdAt: string;
}

export enum StatutCommandeStock {
    EN_COURS = 'en_cours',
    SOUMISE  = 'soumise',
    VALIDE   = 'valide',
    LIVREE   = 'livree',
    ANNULEE  = 'annulee',
}


export interface CommandeStockLigne {
    id?: number;
    produit: { id: string; nom?: string };
    quantite: number;
    prix_unitaire: number;
}


export interface Entrepot { id: number; nom: string }



export interface CommandeStock {
    id: number;
    id_formatted: string;
    date_commande: string;
    statut: StatutCommandeStock;
    date_reception?: string | null;
    montant_total: number | string | null;
    entrepot?: Entrepot | null;
    produits?: CommandeStockLigne[];
}


export interface CreateCommandeStock {
    entrepotId?: number | null;
    lignes: { produitId: string; quantite: number }[];
}

export interface UpdateCommandeStock {
    entrepotId?: number | null;
    lignes?: { produitId: string; quantite: number }[];
}


export type Quota8020Preview = {
    directLivre: number;
    totalLivre: number;
    resteDirectAutorise: number;
};

export interface StockItem {
    id: number;
    quantite: number;
    produit: {
        id: string;
        nom: string;
        prix?: number | string;
        seuil?: number;
        category?: { id: number; nom: string } | null;
    };
}

export type StockListParams = {
    page?: number;
    limit?: number;
    produitId?: string;
    categoryId?: number;
};


export interface Vente {
    id: string;
    id_formatted?: string;
    dateVente: string;
    montant: number | string;
    remiseFidelite?: number | string;
}

export interface Evenement {
    id: string;
    titre: string;
    description?: string | null;
    dateDebut: string;
    dateFin?: string | null;
    franchise?: { id: string; nom: string } | null;

}