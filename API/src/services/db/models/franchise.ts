import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from "typeorm";
import { User } from "./user";
import { Camion } from "./camion";
import { Stock } from "./stock";
import { CommandeStock } from "./commandes_stock";
import { Menu } from "./menu";
import { Vente } from "./vente";

@Entity({ name: 'franchises' })
export class Franchise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column()
  adresse?: string;

  @Column({
    unique: true
  })
  siret: string;

  @Column()
  ville: string;

  @Column()
  code_postal?: number;

  @Column()
  statut: string;

  @OneToMany(() => User, (user) => user.franchise)
  users: User[];

  @OneToOne(() => Camion, (camion) => camion.franchise, { onDelete: 'CASCADE' })
  camion: Camion;


  @OneToMany(() => Stock, (stock) => stock.franchise)
  stocks: Stock[];

  @OneToMany(() => CommandeStock, (commandeStock) => commandeStock.franchise)

  @OneToMany(() => Menu, (m) => m.franchise, { cascade: false })
  menus: Menu[];

  @OneToMany(() => Vente, (vente) => vente.franchise)
  ventes: Vente[];


  @OneToMany(() => CommandeStock, (commandeStock) => commandeStock.franchise)
  commandesStocks: CommandeStock[];


  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date

  constructor(id: string, nom: string, adresse: string, siret: string, ville: string, code_postal: number, statut: string, createdAt: Date, users: User[], camion: Camion, stocks: Stock[], commandesStocks: CommandeStock[], ventes: Vente[], menus: Menu[]) {
    this.id = id,
      this.nom = nom,
      this.adresse = adresse,
      this.siret = siret,
      this.ville = ville,
      this.code_postal = code_postal,
      this.statut = statut,
      this.users = users,
      this.camion = camion,
      this.stocks = stocks,
      this.createdAt = createdAt,
      this.commandesStocks = commandesStocks,
      this.ventes = ventes,
      this.menus = menus
  }
}
