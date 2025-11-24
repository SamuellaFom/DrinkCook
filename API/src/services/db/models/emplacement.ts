import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CamionEmplacement } from "./camionEmplacement";

@Entity({name: "emplacements"})
export class Emplacement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ type: "text", nullable: true })
  adresse: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ length: 20, nullable: true })
  code_postal: string;

  @OneToMany(() => CamionEmplacement, (assign) => assign.emplacement)
  camions: CamionEmplacement[];

  constructor(id: number, nom: string, adresse: string, ville: string, code_postal: string, camions: CamionEmplacement[]) {
    this.id = id,
      this.nom = nom,
      this.adresse = adresse,
      this.ville = ville,
      this.code_postal = code_postal,
      this.camions = camions
  }
}