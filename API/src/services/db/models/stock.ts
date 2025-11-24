import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Franchise } from './franchise';
import { Produit } from './produit';

@Entity('stocks')
@Unique(['franchise', 'produit'])
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Franchise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "franchiseeId" })
  franchise: Franchise;

  @ManyToOne(() => Produit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "produitId" })
  produit: Produit;

  @Column({ type: 'int', default: 0 })
  quantite: number;

  constructor(id: number, franchise: Franchise, produit: Produit, quantite: number) {
    this.id = id,
      this.franchise = franchise,
      this.produit = produit,
      this.quantite = quantite
  }
}
