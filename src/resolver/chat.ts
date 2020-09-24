import { Chat } from "../entity/Chat";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../utils/isAuth";
import { MyContext } from "../MyContext";
import { getConnection, getRepository } from "typeorm";

@InputType()
export class SendMessageInput {
  @Field() chatroomId: number;

  @Field() message: string;
}

@ObjectType()
export class MessagePayload {
  @Field() id: number;

  @Field() fromUser: number;

  @Field() createdAt: Date;

  @Field() message: string;

  @Field() chatroomId: number;

}

@Resolver(Chat)
export class ChatResolver {
  @Subscription({
    topics: "MESSAGES",
  })
  newMessage(@Root() messagePayload: MessagePayload): MessagePayload {
    return {
      ...messagePayload,
    };
  }

  @Query(() => [Chat])
  @UseMiddleware(isAuth)
  async chatRoomMessages(
    @Arg("chatroomId", () => Int) chatroomId: number,
    @Ctx() { authPayload }: MyContext
  ): Promise<Chat[]> {
    const { userId } = authPayload!;

    const belongsToChatroom = await getConnection().query(
      `
      SELECT COUNT(*)
      FROM public.users_to_chatrooms
      WHERE public.users_to_chatrooms."userId" = $2
      AND public.users_to_chatrooms."chatRoomId" = $1
    `,
      [chatroomId, userId]
    );

    if (belongsToChatroom[0].count == 0) {
      throw new Error("You do not belong to this chatroom!");
    }

    return Chat.find({ where: { chatroomId } });
  }

  @Mutation(() => Chat)
  @UseMiddleware(isAuth)
  async sendMessage(
    @Arg("data", () => SendMessageInput) data: SendMessageInput,
    @Ctx() { authPayload }: MyContext
    @PubSub() pubsub: PubSubEngine
  ): Promise<Chat> {
    const { userId } = authPayload!;

    const belongsToChatroom = await getRepository(
      "users_to_chatrooms"
    ).findAndCount({ where: { chatRoomId: data.chatroomId, userId } });

    if (belongsToChatroom[1] === 0) {
      throw new Error("Could not send message.");
    }

    const message = await Chat.create({
      message: data.message,
      fromUser: userId,
      chatroomId: data.chatroomId,
    }).save();

    const payload: MessagePayload = {...message}
    await pubsub.publish("MESSAGES", payload);

    return message;
  }
}
