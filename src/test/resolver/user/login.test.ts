import { graphqlCall } from "../../../test-utils/graphqlCall";
import { Connection } from "typeorm";
import { testConn } from "../../../test-utils/testConn";
import { loginMutation, registerMutation } from "../../source/user";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
  await graphqlCall({
    source: registerMutation,
    variableValues: {
      data: {
        username: "hannKatz",
        email: "hann@example.com",
        password: "password",
      },
    },
  });
});

afterAll(async () => {
  await conn.close();
});

describe("Login", () => {
  it("Should login user", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "hann@example.com",
          password: "password",
        },
      },
    });

    expect(user).toMatchObject({
      data: {
        login: {
          user: {
            username: "hannKatz",
            email: "hann@example.com",
          },
        },
      },
    });
  });

  it("'Shouldn't login user with incorrect email", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "hannah@example.com",
          password: "password",
        },
      },
    });
    expect(user).toMatchObject({
      data: null,
    });
  });

  it("'Shouldn't login user with incorrect email", async () => {
    const user = await graphqlCall({
      source: loginMutation,
      variableValues: {
        data: {
          email: "hann@example.com",
          password: "pass",
        },
      },
    });
    expect(user).toMatchObject({
      data: null,
    });
  });
});
