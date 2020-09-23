import { testConn } from "../../../test-utils/testConn";
import { Connection, getConnection } from "typeorm";
import { graphqlCall } from "../../../test-utils/graphqlCall";
import { loginMutation, registerMutation } from "../../source/user";
import { createChatRoomMutation } from "../../source/chatroom";
import {
  acceptFriendRequestMutation,
  friendRequestMutation,
} from "../../source/request";
import { Request } from "../../../entity/Request";
import { sendMessageMutation } from "../../../test/source/chat";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
  await graphqlCall({
    source: registerMutation,
    variableValues: {
      data: {
        username: "robert2",
        email: "rob2@example.com",
        password: "password",
      },
    },
  });
  await graphqlCall({
    source: registerMutation,
    variableValues: {
      data: {
        username: "robert3",
        email: "rob3@example.com",
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
          email: "rob2@example.com",
          password: "password",
        },
      },
    });

    const friend = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "rob3@example.com",
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

    await graphqlCall({
      source: createChatRoomMutation,
      variableValues: {
        friends: [friendId],
      },
      token,
    });

    const chatRoom = await getConnection().query(
      `
      SELECT public.chat_room.id, public.chat_room."createdAt" 
      FROM public.chat_room 
      INNER JOIN public.users_to_chatrooms
      ON public.users_to_chatrooms."chatRoomId" = public.chat_room.id
      WHERE public.users_to_chatrooms."userId" = $1
    `,
      [friendId]
    );

    const chatroomId = chatRoom[0].id;

    const sendMessage = await graphqlCall({
      source: sendMessageMutation,
      variableValues: {
        data: {
          message: "hiya",
          chatroomId,
        },
      },
      token: friendToken,
    });

    expect(sendMessage).toMatchObject({
      data: {
        sendMessage: {
          message: "hiya",
        },
      },
    });
  });

  it("Should create a chatroom", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "rob2@example.com",
          password: "password",
        },
      },
    });

    const token = user.data?.login.token;

    const sendMessage = await graphqlCall({
      source: sendMessageMutation,
      variableValues: {
        data: {
          message: "hiya",
          chatroomId: 100,
        },
      },
      token,
    });

    expect(sendMessage).toMatchObject({
      data: null,
    });
  });
});
