import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { CarteFidelite } from "./carteFidelite";

@Entity({ name: "clients" })
export class Client {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    nom!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ type: "varchar", length: 20, nullable: true, default: null })
    telephone!: string | null;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @OneToMany(() => CarteFidelite, (carte) => carte.client)
    cartesFidelite!: CarteFidelite[];
}
