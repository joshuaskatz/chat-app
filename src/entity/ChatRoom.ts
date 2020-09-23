import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Chat } from "./Chat";
import { User } from "./User";

@ObjectType()
@Entity()
export class ChatRoom extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable({ name: "users_to_chatrooms" })
  user: User[];

  @Field(() => [Chat])
  @OneToMany(() => Chat, (chat) => chat.fromUser)
  chats: Chat[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
