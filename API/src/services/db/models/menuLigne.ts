import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Menu } from "./menu";
import { Produit } from "./produit";

@Entity()
export class MenuLigne {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Menu, (m) => m.lignes, { nullable: false, onDelete: "CASCADE" })
    menu!: Menu;

    @ManyToOne(() => Produit, { nullable: false })
    produit!: Produit;

    @Column({ type: "integer" })
    quantite!: number;
}
