import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from "typeorm";
import { Camion } from "./camion";
import { Emplacement } from "./emplacement";

@Entity({ name: "camionEmplacements" })
export class CamionEmplacement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Camion, (camion) => camion.emplacements, { onDelete: "CASCADE" })
  camion: Camion;

  @ManyToOne(() => Emplacement, (emplacement) => emplacement.camions, { onDelete: "CASCADE" })
  emplacement: Emplacement;

  @CreateDateColumn()
  date_assignation: Date;

  constructor(id: number, camion: Camion, emplacement: Emplacement, date_assignation: Date) {
    this.id = id,
      this.camion = camion,
      this.emplacement = emplacement,
      this.date_assignation = date_assignation
  }
}