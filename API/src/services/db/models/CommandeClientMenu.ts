import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { CommandeClient } from "./commandeClient";
import { Menu } from "./menu";

@Entity()
export class CommandeClientMenu {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => CommandeClient, (c) => c.menus, { nullable: false, onDelete: "CASCADE" })
    commandeClient!: CommandeClient;

    @ManyToOne(() => Menu, { nullable: false })
    menu!: Menu;

    @Column({ type: "integer" })
    quantite!: number;

    @Column({ type: "numeric", precision: 10, scale: 2 })
    prixUnitaire!: number;
}
