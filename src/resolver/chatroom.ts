import { ChatRoom } from "../entity/ChatRoom";
import { isAuth } from "../utils/isAuth";
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../MyContext";
import { getConnection, getRepository } from "typeorm";

@Resolver(ChatRoom)
export class ChatRoomResolver {
  @Query(() => [ChatRoom])
  @UseMiddleware(isAuth)
  async myChatRooms(@Ctx() { authPayload }: MyContext): Promise<ChatRoom[]> {
    const { userId } = authPayload!;

    return getConnection().query(
      `
      SELECT public.chat_room.id, public.chat_room."createdAt" 
      FROM public.chat_room 
      INNER JOIN public.users_to_chatrooms
      ON public.users_to_chatrooms."chatRoomId" = public.chat_room.id
      WHERE public.users_to_chatrooms."userId" = $1
    `,
      [userId]
    );
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async createChatRoom(
    @Arg("friends", () => [Int]) friends: number[],
    @Ctx() { authPayload }: MyContext
  ): Promise<Boolean> {
    const { userId } = authPayload!;

    if (friends.length === 0) {
      return false;
    }

    const chatRoom = await ChatRoom.create({}).save();

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into("users_to_chatrooms")
      .values([
        { chatRoomId: chatRoom.id, userId },
        ...friends.map((userId) => {
          return { chatRoomId: chatRoom.id, userId };
        }),
      ])
      .execute();

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async leaveChatRoom(
    @Arg("chatRoomId", () => Int) chatRoomId: number,
    @Ctx() { authPayload }: MyContext
  ): Promise<Boolean> {
    const { userId } = authPayload!;

    const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });

    if (!chatRoom) {
      return false;
    }

    const leave = await getRepository("users_to_chatrooms").delete({
      chatRoomId,
      userId,
    });

    const usersLeft = await getRepository("users_to_chatrooms").findAndCount({
      where: {
        chatRoomId,
      },
    });

    if (usersLeft[1] === 1) {
      await ChatRoom.delete({ id: chatRoomId });
    }

    if (leave.affected === 0) {
      return false;
    }

    return true;
  }
}
