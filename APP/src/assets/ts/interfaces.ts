import { Vente } from "./FranchiseInterface";

export type DecodedToken = {
  userId: string;
  role: string;
  name: string;
  franchiseId?: string|null;
};

export type AuthContextType = {
  user: string | null;
  id: string | null;
  role: string | null;
  franchiseId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
};

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface Produit {
  id: string;
  nom: string;
  prix?: string;
  description: string;
  actif: boolean;
  seuil: number;
  category: {
    id: number
    nom: string
  }
}

export interface Stock {
  id: number;
  produit: Produit;
  quantite: number;
}

export interface Camion {
  id: number;
  immatriculation: string;
  date_achat: Date;
  kilometrage: number;
  statut: 'disponible' | 'en_mission' | string;
  franchise: Franchise;
  pannes: Panne[];
  entretiens: Entretien[];
  emplacements: CamionEmplacement[];
}

export interface Entretien {
  id: number;
  date_revision: string;
  description: string;
  kilometrage?: number;
  realisé_par?: string;
  created_at: string;
}

export interface Panne {
  id: number;
  date_panne: Date;
  description: string;
  statut: "declarée" | "en_cours" | "reparéee" | string;
  created_at: Date;
  camion: Camion
}

export interface CamionEmplacement {
  id: number;
  date_assignation: string;
  emplacement: Emplacement;
}

export interface Emplacement {
  id: number;
  nom: string;
  ville?: string;
  adresse?: string;
  code_postal?: string;
}

export interface Entrepot {
  id: number;
  nom: string;
  adresse: string,
  ville: string,
  code_postal: string,
  commandesStocks: CommandeStock[]
}

export interface ProduitCommande {
  id: number;
  produit: Produit;
  quantite: number;
  prix_unitaire: string;
}

export interface CommandeStock {
  id: number;
  id_formatted: string,
  entrepot: Entrepot;
  date_commande: Date;
  montant_total: number;
  statut: 'en_cours' | 'soumise' | 'valide' | 'expediee' | 'livree' | 'annulee' | string;
  produits: ProduitCommande[];
}

export interface Franchise {
  id: string;
  nom: string;
  adresse: string;
  siret: string;
  ville: string;
  code_postal: number;
  statut: 'active' | 'inactive' | 'en_attente';
  users: any[];
  camion: Camion;
  stocks: Stock[];
  createdAt: string;
  commandesStocks: CommandeStock[];
  ventes: Vente[]
}

export interface User {
  id: string,
  username: string,
  email: string,
  franchise: Franchise,
  role: {
    type: string
  }
}
