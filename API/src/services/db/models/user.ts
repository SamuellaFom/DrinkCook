import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Franchise } from './franchise';
import { Role } from './role';
import { Token } from './token';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({
    unique: true
  })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @ManyToOne(() => Role, { nullable: false, eager: true })
  @JoinColumn({ name: "roleId" })
  role: Role;

  @ManyToOne(() => Franchise, (franchise) => franchise.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: "franchiseId" })
  franchise: Franchise;

  @OneToMany(() => Token, token => token.user)
  tokens: Token[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date

  constructor(id: string, username: string, email: string, avatar: string, password: string, role: Role, franchise: Franchise, createdAt: Date, updatedAt: Date, tokens: Token[]) {
    this.id = id,
      this.username = username,
      this.email = email,
      this.avatar = avatar,
      this.password = password,
      this.role = role,
      this.franchise = franchise,
      this.tokens = tokens,
      this.createdAt = createdAt,
      this.updatedAt = updatedAt
  }
}
