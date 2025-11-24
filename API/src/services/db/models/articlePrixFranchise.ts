import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique, JoinColumn } from "typeorm";
import { Franchise } from "./franchise";
import { Produit } from "./produit";

@Entity({ name: "article_prix_franchise" })
@Unique(["franchise", "produit"])
export class ArticlePrixFranchise {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Franchise, { onDelete: "CASCADE", eager: true, nullable: false })
    @JoinColumn({ name: "franchise_id" })
    franchise!: Franchise;

    @ManyToOne(() => Produit, { onDelete: "CASCADE", eager: true, nullable: false })
    @JoinColumn({ name: "produit_id" })
    produit!: Produit;

    @Column({ type: "boolean", default: true })
    actif!: boolean;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    prix_vente!: number | null;
}
