import { Emplacement } from "@/services/db/models/emplacement";

export const emplacementFixture: Partial<Emplacement>[] = [
  {
    "id": 1,
    "nom": "Marché Central",
    "adresse": "12 Rue de Paris",
    "ville": "Paris",
    "code_postal": "75001",
  },
  {
    "id": 2,
    "nom": "Parc des Expositions",
    "adresse": "1 Boulevard des Expos",
    "ville": "Lille",
    "code_postal": "59000"
  },
  {
    "id": 3,
    "nom": "Festival d'été",
    "adresse": "Place de la République",
    "ville": "Marseille",
    "code_postal": "13001",
  }
]
