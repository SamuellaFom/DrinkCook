import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Client } from "./client";
import { Franchise } from "./franchise";
import {CommandeClientProduit} from "./commandeClientProduit";
import {CommandeClientMenu} from "./CommandeClientMenu";
import {StatutCommandeClient} from "../../enums";




@Entity({ name: "commandeClients" })
export class CommandeClient {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "boolean", default: false })
    utiliserPointsFidelite!: boolean;


    @ManyToOne(() => Client, { nullable: true, onDelete: "SET NULL", eager: true })
    client!: Client | null;

    @ManyToOne(() => Franchise, { nullable: false, eager: true })
    franchise!: Franchise;

    @OneToMany(() => CommandeClientProduit, (ccp) => ccp.commandeClient)
    lignes!: CommandeClientProduit[];


    @OneToMany(() => CommandeClientMenu, (m) => m.commandeClient)
    menus!: CommandeClientMenu[];


    @CreateDateColumn({ type: "timestamptz"})
    dateCommande!: Date;


    @Column({
        type: "enum",
        enum: StatutCommandeClient,
        default: StatutCommandeClient.EN_ATTENTE
    })
    statut!: StatutCommandeClient;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    montantTotal!: number;




}