import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Camion } from "./camion";

@Entity({name: "entretiens"})
export class Entretien {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Camion, (camion) => camion.entretiens, { onDelete: "CASCADE" })
  camion: Camion;

  @Column({ type: "timestamptz" })
  date_revision: Date;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "int", nullable: true })
  kilometrage: number;

  @Column({ length: 100, nullable: true })
  realisé_par: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  constructor(id: number, camion: Camion, date_revision: Date, description: string, kilometrage: number, realisé_par: string, created_at: Date) {
    this.id = id,
      this.camion = camion,
      this.date_revision = date_revision,
      this.description = description,
      this.kilometrage = kilometrage,
      this.realisé_par = realisé_par,
      this.created_at = created_at
  }
}