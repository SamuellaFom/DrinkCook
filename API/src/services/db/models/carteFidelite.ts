import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne, Unique,
} from "typeorm";
import { Client } from "./client";
import { Franchise } from "./franchise";




@Entity({ name: "cartesFidelite" })
@Unique(["client", "franchise"])
export class CarteFidelite {
    @PrimaryGeneratedColumn("uuid")
    id!: string;


    @Column({ default: 0})
    points: number;

    @ManyToOne(() => Client, { onDelete: "CASCADE", eager: true, nullable: false })
    client: Client;

    @ManyToOne(() => Franchise, { eager: true, nullable: false })
    franchise: Franchise;



    constructor(client: Client, franchise: Franchise, points?: number) {
        this.client = client;
        this.franchise = franchise;
        this.points = points || 0;
    }

}



