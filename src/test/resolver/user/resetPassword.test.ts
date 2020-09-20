import { graphqlCall } from "../../../test-utils/graphqlCall";
import { Connection } from "typeorm";
import { testConn } from "../../../test-utils/testConn";
import {
  passwordResetRequestMutation,
  registerMutation,
} from "../../source/user";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
  await graphqlCall({
    source: registerMutation,
    variableValues: {
      data: {
        username: "edwardkatz",
        email: "ed@example.com",
        password: "password",
      },
    },
  });
});

afterAll(async () => {
  await conn.close();
});

describe("Reset password", () => {
  it("Should send email with link to password reset if user exists", async () => {
    const user = await graphqlCall({
      source: passwordResetRequestMutation,
      variableValues: {
        email: "ed@example.com",
      },
    });
    console.log(user);
    expect(user).toMatchObject({
      data: {
        requestResetPassword: true,
      },
    });
  });

  it("Should fail to send email if user/email doesn't exist", async () => {
    const user = await graphqlCall({
      source: passwordResetRequestMutation,
      variableValues: {
        email: "edward@example.com",
      },
    });
    console.log(user);
    expect(user).toMatchObject({
      data: {
        requestResetPassword: false,
      },
    });
  });
});
