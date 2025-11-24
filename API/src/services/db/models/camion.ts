import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Franchise } from './franchise';
import { CamionStatut } from '../../enums';
import { Entretien } from './entretien';
import { Panne } from './panne';
import { CamionEmplacement } from './camionEmplacement';

@Entity({ name: 'camions' })
export class Camion {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Franchise, (franchise) => franchise.camion, { eager: true })
  @JoinColumn()
  franchise: Franchise;

  @Column()
  immatriculation: string;

  @Column({ type: "timestamptz" })
  date_achat: Date;

  @Column()
  kilometrage: number;

  @Column({
    type: 'enum',
    enum: CamionStatut,
    default: CamionStatut.DISPONIBLE,
  })
  statut: CamionStatut;

  @OneToMany(() => Entretien, (entretien) => entretien.camion)
  entretiens: Entretien[];

  @OneToMany(() => Panne, (panne) => panne.camion)
  pannes: Panne[];

  @OneToMany(() => CamionEmplacement, (assign) => assign.camion)
  emplacements: CamionEmplacement[];

  constructor(id: number, franchise: Franchise, immatriculation: string, date_achat: Date, kilometrage: number, statut: CamionStatut, entretiens: Entretien[], pannes: Panne[], emplacements: CamionEmplacement[]) {
    this.id = id,
      this.franchise = franchise,
      this.immatriculation = immatriculation,
      this.date_achat = date_achat,
      this.kilometrage = kilometrage,
      this.statut = statut,
      this.entretiens = entretiens,
      this.pannes = pannes,
      this.emplacements = emplacements
  }
}