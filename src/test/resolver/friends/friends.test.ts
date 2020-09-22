import { graphqlCall } from "../../../test-utils/graphqlCall";
import { Connection } from "typeorm";
import { testConn } from "../../../test-utils/testConn";
import { loginMutation, registerMutation } from "../../source/user";
import {
  acceptFriendRequestMutation,
  deleteFriendRequestMutation,
  friendRequestMutation,
  removeFriendMutation,
} from "../../source/request";
import { Request } from "../../../entity/Request";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
  await graphqlCall({
    source: registerMutation,
    variableValues: {
      data: {
        username: "miriamSchwarz",
        email: "miriam@example.com",
        password: "password",
      },
    },
  });
  await graphqlCall({
    source: registerMutation,
    variableValues: {
      data: {
        username: "eliKatz",
        email: "eli@example.com",
        password: "password",
      },
    },
  });
});

afterAll(async () => {
  await conn.close();
});

describe("Friend requests", () => {
  it("Should send a friend request", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "miriam@example.com",
          password: "password",
        },
      },
    });

    const friend = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "eli@example.com",
          password: "password",
        },
      },
    });

    const friendId = parseInt(friend.data?.login.user.id);
    const token = user.data?.login.token;
    const request = await graphqlCall({
      source: friendRequestMutation,
      variableValues: {
        user: friendId,
      },
      token,
    });

    expect(request).toMatchObject({
      data: {
        friendRequest: "true",
      },
    });
  });

  it("Should fail to send a friend request if user doesn't exist", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "miriam@example.com",
          password: "password",
        },
      },
    });

    const token = user.data?.login.token;
    const request = await graphqlCall({
      source: friendRequestMutation,
      variableValues: {
        user: 100,
      },
      token,
    });

    expect(request).toMatchObject({
      data: {
        friendRequest: "false",
      },
    });
  });

  it("Should fail to send a friend request if request already exists", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "miriam@example.com",
          password: "password",
        },
      },
    });

    const friend = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "eli@example.com",
          password: "password",
        },
      },
    });

    const friendId = parseInt(friend.data?.login.user.id);
    const token = user.data?.login.token;
    const request = await graphqlCall({
      source: friendRequestMutation,
      variableValues: {
        user: friendId,
      },
      token,
    });

    expect(request).toMatchObject({
      data: {
        friendRequest: "false",
      },
    });
  });

  it("Should accept a friend request", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "eli@example.com",
          password: "password",
        },
      },
    });

    const userId = parseInt(user.data?.login.user.id);
    const token = user.data?.login.token;
    const request = await Request.findOne({ where: { toUser: userId } });

    const acceptRequest = await graphqlCall({
      source: acceptFriendRequestMutation,
      variableValues: {
        token: request?.token,
      },
      token,
    });

    expect(acceptRequest).toMatchObject({
      data: {
        acceptFriendRequest: true,
      },
    });
  });

  it("Shouldn't accept a friend request if request doesn't exist", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "eli@example.com",
          password: "password",
        },
      },
    });

    const token = user.data?.login.token;

    const acceptRequest = await graphqlCall({
      source: acceptFriendRequestMutation,
      variableValues: {
        token: "IncorrectToken",
      },
      token,
    });

    expect(acceptRequest).toMatchObject({
      data: {
        acceptFriendRequest: false,
      },
    });
  });

  it("Should delete a friend request", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "eli@example.com",
          password: "password",
        },
      },
    });

    const friend = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "miriam@example.com",
          password: "password",
        },
      },
    });

    const friendId = parseInt(friend.data?.login.user.id);
    const friendToken = friend.data?.login.token;
    const token = user.data?.login.token;

    await graphqlCall({
      source: friendRequestMutation,
      variableValues: {
        user: friendId,
      },
      token,
    });

    const request = await Request.findOne({ where: { toUser: friendId } });

    const deleteRequest = await graphqlCall({
      source: deleteFriendRequestMutation,
      variableValues: {
        token: request?.token,
      },
      token: friendToken,
    });

    expect(deleteRequest).toMatchObject({
      data: {
        deleteFriendRequest: true,
      },
    });
  });

  it("Should delete a friend request", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "miriam@example.com",
          password: "password",
        },
      },
    });

    const token = user.data?.login.token;

    const deleteRequest = await graphqlCall({
      source: deleteFriendRequestMutation,
      variableValues: {
        token: "IncorrectToken",
      },
      token,
    });

    expect(deleteRequest).toMatchObject({
      data: {
        deleteFriendRequest: false,
      },
    });
  });

  it("Should remove a friend", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "eli@example.com",
          password: "password",
        },
      },
    });

    const friend = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "miriam@example.com",
          password: "password",
        },
      },
    });

    const friendId = parseInt(friend.data?.login.user.id);
    const token = user.data?.login.token;

    const removeFriend = await graphqlCall({
      source: removeFriendMutation,
      variableValues: {
        user: friendId,
      },
      token,
    });

    expect(removeFriend).toMatchObject({
      data: {
        removeFriend: true,
      },
    });
  });

  it("Should fail if user doesn't exist", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "eli@example.com",
          password: "password",
        },
      },
    });

    const token = user.data?.login.token;

    const removeFriend = await graphqlCall({
      source: removeFriendMutation,
      variableValues: {
        user: 100,
      },
      token,
    });

    expect(removeFriend).toMatchObject({
      data: {
        removeFriend: false,
      },
    });
  });
});
