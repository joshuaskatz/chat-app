import { testConn } from "../../../test-utils/testConn";
import { Connection, getConnection } from "typeorm";
import { graphqlCall } from "../../../test-utils/graphqlCall";
import { loginMutation, registerMutation } from "../../source/user";
import {
  createChatRoomMutation,
  leaveChatRoomMutation,
} from "../../source/chatroom";
import {
  acceptFriendRequestMutation,
  friendRequestMutation,
} from "../../source/request";
import { Request } from "../../../entity/Request";
import { ChatRoom } from "../../../entity/ChatRoom";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
  await graphqlCall({
    source: registerMutation,
    variableValues: {
      data: {
        username: "robert",
        email: "rob@example.com",
        password: "password",
      },
    },
  });
  await graphqlCall({
    source: registerMutation,
    variableValues: {
      data: {
        username: "robert1",
        email: "rob1@example.com",
        password: "password",
      },
    },
  });
});

afterAll(async () => {
  await conn.close();
});

describe("Chat Room", () => {
  it("Should create a chatroom", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "rob@example.com",
          password: "password",
        },
      },
    });

    const friend = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "rob1@example.com",
          password: "password",
        },
      },
    });

    const friendId = parseInt(friend.data?.login.user.id);
    const friendToken = user.data?.login.token;
    const token = user.data?.login.token;

    await graphqlCall({
      source: friendRequestMutation,
      variableValues: {
        user: friendId,
      },
      token,
    });

    const request = await Request.findOne({ where: { toUser: friendId } });

    await graphqlCall({
      source: acceptFriendRequestMutation,
      variableValues: {
        token: request?.token,
      },
      token: friendToken,
    });

    const createChatRoom = await graphqlCall({
      source: createChatRoomMutation,
      variableValues: {
        friends: [friendId],
      },
      token,
    });

    expect(createChatRoom).toMatchObject({
      data: {
        createChatRoom: true,
      },
    });
  });

  it("Shouldn't create chatroom if friend doesn't exist", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "rob@example.com",
          password: "password",
        },
      },
    });

    const token = user.data?.login.token;

    const createChatRoom = await graphqlCall({
      source: createChatRoomMutation,
      variableValues: {
        friends: [100],
      },
      token,
    });

    expect(createChatRoom).toMatchObject({
      data: null,
    });
  });

  it("Shouldn't create chatroom if no friends are added", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "rob@example.com",
          password: "password",
        },
      },
    });

    const token = user.data?.login.token;

    const createChatRoom = await graphqlCall({
      source: createChatRoomMutation,
      variableValues: {
        friends: [],
      },
      token,
    });

    expect(createChatRoom).toMatchObject({
      data: {
        createChatRoom: false,
      },
    });
  });

  it("Should leave chatroom and delete if less than two people are left", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "rob@example.com",
          password: "password",
        },
      },
    });

    const token = user.data?.login.token;
    const userId = user.data?.login.user.id;

    const chatRoom = await getConnection().query(
      `
      SELECT public.chat_room.id, public.chat_room."createdAt" 
      FROM public.chat_room 
      INNER JOIN public.users_to_chatrooms
      ON public.users_to_chatrooms."chatRoomId" = public.chat_room.id
      WHERE public.users_to_chatrooms."userId" = $1
    `,
      [userId]
    );

    const chatRoomId = chatRoom[0].id;

    const leaveChatRoom = await graphqlCall({
      source: leaveChatRoomMutation,
      variableValues: {
        chatRoomId,
      },
      token,
    });

    const chatRoomExists = await ChatRoom.findOne({
      where: { id: chatRoomId },
    });

    expect(chatRoomExists).toBe(undefined);

    expect(leaveChatRoom).toMatchObject({
      data: {
        leaveChatRoom: true,
      },
    });
  });

  it("Shouldn't leave chatroom if chatroom doesn't exist", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "rob@example.com",
          password: "password",
        },
      },
    });

    const token = user.data?.login.token;

    const leaveChatRoom = await graphqlCall({
      source: leaveChatRoomMutation,
      variableValues: {
        chatRoomId: 100,
      },
      token,
    });

    expect(leaveChatRoom).toMatchObject({
      data: {
        leaveChatRoom: false,
      },
    });
  });
});
