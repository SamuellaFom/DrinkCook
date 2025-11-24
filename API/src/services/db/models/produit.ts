import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CategoryProduct } from './categoryProduct';
import { Stock } from './stock';
import { CommandeStockProduit } from './commande_stock_produit';

@Entity({ name: 'produits' })
export class Produit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @ManyToOne(() => CategoryProduct, { nullable: false, eager: true })
  @JoinColumn({ name: "categoryId" })
  category: CategoryProduct;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix: number;

  @Column({ type: 'integer', nullable: true })
  seuil: number;


  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @OneToMany(() => Stock, (stock) => stock.produit)
  stocks: Stock[];

  @OneToMany(() => CommandeStockProduit, (csp) => csp.produit)
  commandeStockProduits: CommandeStockProduit[];


  constructor(id: string, nom: string, category: CategoryProduct, seuil: number, description: string, prix: number, actif: boolean, stocks: Stock[], commandeStockProduits: CommandeStockProduit[]) {
    this.id = id,
      this.nom = nom,
      this.category = category,
      this.seuil = seuil,
      this.description = description,
      this.prix = prix,
      this.actif = actif
    this.stocks = stocks
    this.commandeStockProduits = commandeStockProduits
  }
}
