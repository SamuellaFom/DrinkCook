import { Camion } from "../services/db/models/camion";
import { CamionStatut } from "../services/enums";

export const camionFixture = [
  {
    "franchise": {id: "998e667e-511e-4bf2-852a-98a67eb9e71f"},
    "immatriculation": "ZL-172-UW",
    "date_achat": new Date("2021-03-15"),
    "kilometrage": 44895,
    "statut": CamionStatut.DISPONIBLE
  },
  {
    "franchise": {id: "51c2f85e-b530-44b8-bd4b-078c4482dcb8"},
    "immatriculation": "TR-841-OP",
    "date_achat": new Date("2019-10-22"),
    "kilometrage": 118446,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": {id: "e201dd85-73aa-4653-9677-5054560b4d8b"},
    "immatriculation": "YM-492-EY",
    "date_achat": new Date("2020-03-11"),
    "kilometrage": 107283,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": {id: "3ea4e4a2-87a1-4e87-9195-1a4935bb84f0"},
    "immatriculation": "HR-730-IG",
    "date_achat": new Date("2018-04-05"),
    "kilometrage": 167390,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": {id: "0749ed7a-a74a-43e9-bcfa-15aed26da0fd"},
    "immatriculation": "RH-903-AQ",
    "date_achat": new Date("2022-08-17"),
    "kilometrage": 72565,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": {id: "d0719e0a-f482-43f5-aa84-c86efe2479b2"},
    "immatriculation": "GV-482-LG",
    "date_achat": new Date("2020-12-09"),
    "kilometrage": 97080,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": {id: "fd0952cf-b6a7-4270-aab9-030fcbe4479f"},
    "immatriculation": "RN-793-MO",
    "date_achat": new Date("2018-05-29"),
    "kilometrage": 176325,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": {id: "a25029e2-5637-4000-99be-2d30dfb4c2df"},
    "immatriculation": "SJ-612-JT",
    "date_achat": new Date ("2019-11-14"),
    "kilometrage": 148024,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": {id: "86b5eb11-c128-4a61-ba02-41938a78f7be"},
    "immatriculation": "MF-161-QL",
    "date_achat": new Date("2022-02-18"),
    "kilometrage": 55893,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": {id: "209d159f-11d6-48bb-bc6f-a55d06060624"},
    "immatriculation": "PS-805-WK",
    "date_achat": new Date("2021-07-26"),
    "kilometrage": 81751,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": {id: "e4eb9179-6fdc-4057-a2e7-09de32c6acc0"},
    "immatriculation": "EW-856-DD",
    "date_achat": new Date("2020-03-03"),
    "kilometrage": 137815,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": { id: "5f1d6a5c-f4b5-4502-b8b9-b09a08703b3b"},
    "immatriculation": "DP-276-RD",
    "date_achat": new Date("2023-12-01"),
    "kilometrage": 13181,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": { id: "bdf2eb00-f9a4-43e0-9c65-2b1ba0e96cda"},
    "immatriculation": "KU-624-TI",
    "date_achat": new Date("2019-04-27"),
    "kilometrage": 108724,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": { id: "2b005a9c-2260-4ff6-a4bc-3c2ccc2adace"},
    "immatriculation": "HP-909-YU",
    "date_achat": new Date("2021-01-30"),
    "kilometrage": 127426,
    "statut": CamionStatut.EN_MISSION
  },
  {
    "franchise": { id: "d5d93f6e-0c0d-4461-90e5-f497d2d57ef1"},
    "immatriculation": "PY-193-CL",
    "date_achat": new Date ("2020-12-20"),
    "kilometrage": 110826,
    "statut": CamionStatut.HORS_SERVICE
  }
]
