export enum CamionStatut {
  DISPONIBLE = 'disponible',
  EN_REPARATION = 'en_reparation',
  EN_MISSION = 'en_mission',
  HORS_SERVICE = 'hors_service',
}

export enum PanneStatut {
  DECLARE = "déclarée",
  EN_COURS = 'en_cours',
  REPAREE = 'reparée',
}

export enum StatutCommande {
  EN_COURS = 'en_cours', 
  SOUMISE = 'soumise', 
  VALIDE = 'valide', 
  EXPEDIEE = 'expediee', 
  LIVREE = 'livree', 
  ANNULEE = 'annulee', 
}

export enum TypeRole {
  ADMIN = "Administrateur",
  MANAGER = "Manager",
  EMPLOYE = "Employe"
}

export enum StatutCommandeClient {
  EN_ATTENTE = "en_attente",
  PAYEE = "payee",
  LIVREE = "livree",
  ANNULEE = "annulee",
}