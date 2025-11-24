import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
    JoinColumn,

} from "typeorm";
import { CommandeClient} from "./commandeClient";
import {Produit} from "./produit";


@Entity({ name: "commandeClientProduits" })
@Unique(["commandeClient", "produit"])
export class CommandeClientProduit {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(()=>CommandeClient, { onDelete: "CASCADE", eager: true, nullable: false})
    commandeClient!: CommandeClient;

    @ManyToOne(() => Produit, { onDelete: "CASCADE", eager: true, nullable: false})
    produit!: Produit;

    @Column()
    quantite!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    prixUnitaire!: number;



}
