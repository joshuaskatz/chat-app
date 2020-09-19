import { ObjectType, Field, ID } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Request extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  token: string;

  @Field()
  @Column("int")
  @ManyToOne(() => User, (user) => user.requests)
  @JoinColumn({ name: "toUser" })
  toUser: number;

  @Field()
  @Column("int")
  @ManyToOne(() => User, (user) => user.requests)
  @JoinColumn({ name: "fromUser" })
  fromUser: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
