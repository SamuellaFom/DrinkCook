import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Franchise } from './franchise';
import { Entrepot } from './entrepot';
import { StatutCommande } from '../../enums';
import { CommandeStockProduit } from './commande_stock_produit';

@Entity('commandes_stocks')
export class CommandeStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_formatted: string;

  @ManyToOne(() => Franchise, (franchise) => franchise.commandesStocks, {
    onDelete: 'CASCADE',
  })
  franchise: Franchise;

  @ManyToOne(() => Entrepot, (entrepot) => entrepot.commandesStocks, {
    onDelete: 'CASCADE',
  })
  entrepot: Entrepot;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_commande: Date;


  @Column({ type: 'timestamp', nullable: true })
  date_reception: Date | null;


  @Column({
    type: 'enum',
    enum: StatutCommande,
    default: StatutCommande.EN_COURS,
  })
  statut: StatutCommande;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montant_total: number;

  @OneToMany(() => CommandeStockProduit, (csp) => csp.commande)
  produits: CommandeStockProduit[];

  @BeforeInsert()
  generateCustomId() {
    const now = new Date();
    const datePart = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;

    const uniquePart = Date.now().toString().slice(-5);

    this.id_formatted = `${datePart}${uniquePart}`;
  }

  constructor(id: number, id_formatted: string, franchise: Franchise, entrepot: Entrepot, date_commande: Date, date_reception: Date, statut: StatutCommande, montant_total: number, produits: CommandeStockProduit[]) {
    this.id = id,
      this.id_formatted = id_formatted
    this.franchise = franchise,
      this.entrepot = entrepot,
      this.date_commande = date_commande,
      this.date_reception = date_reception,
      this.statut = statut,
      this.montant_total = montant_total
    this.produits = produits
  }
}