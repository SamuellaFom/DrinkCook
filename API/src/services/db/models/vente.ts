import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,   BeforeInsert} from "typeorm";
import {CommandeClient} from "./commandeClient";
import {Franchise} from "./franchise";


@Entity({ name: "ventes"})
export class Vente {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: true })
    id_formatted?: string;


    @ManyToOne(() => CommandeClient, { onDelete: "CASCADE", eager: true, nullable: false})
    commandeClient: CommandeClient;

    @ManyToOne (() => Franchise, { onDelete: "CASCADE", eager: true, nullable: false})
    franchise: Franchise;

    @Column({ type: "decimal", precision:10, scale: 2})
    montant: number;

    @CreateDateColumn({ type: "timestamptz"})
    dateVente!: Date;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0, name: "remise_fidelite" })
    remiseFidelite!: number;

    @BeforeInsert()
    generateCustomId() {
        const now = new Date();
        const datePart = `${now.getFullYear()}${(now.getMonth() + 1)
            .toString()
            .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;

        const uniquePart = Date.now().toString().slice(-5);

        this.id_formatted = `${datePart}${uniquePart}`;
    }

    constructor(id_formatted: string  ,commandeClient: CommandeClient, franchise: Franchise, montant: number) {
        this.id_formatted = id_formatted ;
        this.commandeClient = commandeClient;
        this.franchise = franchise;
        this.montant = montant;
    }
}

