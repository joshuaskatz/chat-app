import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatRoom } from "./ChatRoom";
import { User } from "./User";

@ObjectType()
@Entity()
export class Chat extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column("int")
  @ManyToOne(() => User, (user) => user.chats)
  @JoinColumn({ name: "fromUser" })
  fromUser: number;

  @Field()
  @Column("int")
  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.chats)
  @JoinColumn({ name: "chatroomId" })
  chatroomId: number;

  @Field(() => String)
  @Column()
  message: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
