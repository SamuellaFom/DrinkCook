import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "categoryProduct" })
export class CategoryProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  constructor(id: number, nom: string) {
    this.id = id;
    this.nom = nom;
  }
}