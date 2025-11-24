import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { Franchise } from "./franchise";

@Entity({ name: "evenements" })
export class Evenement {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    titre!: string;

    @Column("text", { nullable: true})
    description!: string;

    @Column("timestamptz", { name: "date_debut" })
    dateDebut!: Date;

    @Column("timestamptz", { name: "date_fin", nullable: true })
    dateFin!: Date;


    @ManyToOne(() => Franchise, { nullable: false, onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: "franchise_id" })
    franchise!: Franchise;


}
