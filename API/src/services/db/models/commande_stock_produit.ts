import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeInsert,
} from 'typeorm';
import { CommandeStock } from './commandes_stock';
import { Produit } from './produit';

@Entity('commande_stock_produits')
export class CommandeStockProduit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_formatted: string;

  @ManyToOne(() => CommandeStock, (commande) => commande.produits, {
    onDelete: 'CASCADE',
  })
  commande: CommandeStock;

  @ManyToOne(() => Produit, (produit) => produit.commandeStockProduits, {
    onDelete: 'CASCADE',
  })
  produit: Produit;

  @Column({ type: 'int' })
  quantite: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix_unitaire: number;

  @BeforeInsert()
  generateCustomId() {
    const now = new Date();
    const datePart = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;

    const uniquePart = Date.now().toString().slice(-5);

    this.id_formatted = `${datePart}${uniquePart}`;
  }

  constructor(id: number, commande: CommandeStock, produit: Produit, quantite: number, prix_unitaire: number, id_formatted: string) {
    this.id = id,
      this.id_formatted = id_formatted,
      this.commande = commande,
      this.produit = produit,
      this.quantite = quantite,
      this.prix_unitaire = prix_unitaire
  }
}