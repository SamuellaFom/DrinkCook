import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { CommandeStock } from './commandes_stock';

@Entity({ name: 'entrepots' })
export class Entrepot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  adresse: string;

  @Column()
  ville: string;

  @Column()
  code_postal: string;

  @OneToMany(() => CommandeStock, (commandeStock) => commandeStock.entrepot)
  commandesStocks: CommandeStock[];

  constructor(id: number, nom: string, adresse: string, ville: string, code_postal: string, commandesStocks: CommandeStock[]) {
    this.id = id,
      this.nom = nom,
      this.adresse = adresse,
      this.ville = ville,
      this.code_postal = code_postal
    this.commandesStocks = commandesStocks
  }
}