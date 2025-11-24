import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Camion } from "./camion";
import { PanneStatut } from "../../enums";

@Entity({name: "pannes"})
export class Panne {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Camion, (camion) => camion.pannes, { onDelete: "CASCADE" })
  camion: Camion;

  @Column({ type: "timestamptz" })
  date_panne: Date;

  @Column({ type: "text" })
  description: string;

  @Column({
    type: "enum",
    enum: PanneStatut,
    default: PanneStatut.DECLARE,
  })
  statut: string;

  @CreateDateColumn()
  created_at: Date;

  constructor(id: number, camion: Camion, date_panne: Date, description: string, statut: string, created_at: Date) {
    this.id = id,
      this.camion = camion,
      this.date_panne = date_panne,
      this.description = description,
      this.statut = statut,
      this.created_at = created_at
  }
}