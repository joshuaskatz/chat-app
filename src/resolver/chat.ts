import { Chat } from "../entity/Chat";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../utils/isAuth";
import { MyContext } from "../MyContext";
import { getRepository } from "typeorm";

@InputType()
export class SendMessageInput {
  @Field() chatroomId: number;

  @Field() message: string;
}

@Resolver(Chat)
export class ChatResolver {
  @Mutation(() => Chat)
  @UseMiddleware(isAuth)
  async sendMessage(
    @Arg("data", () => SendMessageInput) data: SendMessageInput,
    @Ctx() { authPayload }: MyContext
  ): Promise<Chat> {
    const { userId } = authPayload!;

    const belongsToChatroom = await getRepository(
      "users_to_chatrooms"
    ).findAndCount({ where: { chatRoomId: data.chatroomId, userId } });

    if (belongsToChatroom[1] === 0) {
      throw new Error("Could not send message.");
    }

    return Chat.create({
      message: data.message,
      fromUser: userId,
      chatroomId: data.chatroomId,
    }).save();
  }
}
