import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({name: "roles"})
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  constructor(id: number, type: string) {
    this.id = id;
    this.type = type;
  }
}
