import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { Franchise } from "./franchise";
import { MenuLigne } from "./menuLigne";

@Entity()
export class Menu {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 200 })
    nom!: string;

    @Column({ type: "text", nullable: true })
    description?: string | null;

    @Column({ type: "numeric", precision: 10, scale: 2 })
    prix!: number;

    @Column({ type: "boolean", default: true })
    actif!: boolean;

    @ManyToOne(() => Franchise, (f) => f.menus, { nullable: false })
    franchise!: Franchise;

    @OneToMany(() => MenuLigne, (l) => l.menu, { cascade: false })
    lignes!: MenuLigne[];

    @CreateDateColumn()
    createdAt!: Date;
}
