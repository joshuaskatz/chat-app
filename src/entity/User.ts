import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Request } from "./Request";
import { Chat } from "./Chat";
import { ChatRoom } from "./ChatRoom";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ unique: true })
  username: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Field(() => [Request])
  @OneToMany(() => Request, (request) => request.fromUser)
  requests: Request[];

  @Field(() => [Chat])
  @OneToMany(() => Chat, (chat) => chat.fromUser)
  chats: Chat[];

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable({
    name: "friends",
    joinColumn: {
      name: "user",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "friend",
      referencedColumnName: "id",
    },
  })
  friends: User[];

  @Field(() => [ChatRoom])
  @ManyToMany(() => ChatRoom)
  @JoinTable({ name: "users_to_chatrooms" })
  chatrooms: ChatRoom[];

  @Column()
  password: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column("bigint", { nullable: true })
  resetTokenExpiry: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
