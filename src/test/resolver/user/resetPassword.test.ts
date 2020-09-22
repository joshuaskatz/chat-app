import { graphqlCall } from "../../../test-utils/graphqlCall";
import { Connection } from "typeorm";
import { testConn } from "../../../test-utils/testConn";
import {
  passwordResetRequestMutation,
  registerMutation,
  resetPasswordMutation,
} from "../../source/user";
import { User } from "../../../entity/User";

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
    const request = await graphqlCall({
      source: passwordResetRequestMutation,
      variableValues: {
        email: "ed@example.com",
      },
    });

    expect(request).toMatchObject({
      data: {
        requestResetPassword: true,
      },
    });
  });

  it("Should fail to send email if user/email doesn't exist", async () => {
    const request = await graphqlCall({
      source: passwordResetRequestMutation,
      variableValues: {
        email: "edward@example.com",
      },
    });

    expect(request).toMatchObject({
      data: {
        requestResetPassword: false,
      },
    });
  });

  it("Should reset password", async () => {
    await graphqlCall({
      source: passwordResetRequestMutation,
      variableValues: {
        email: "ed@example.com",
      },
    });

    const user = await User.findOne({ where: { email: "ed@example.com" } });

    const reset = await graphqlCall({
      source: resetPasswordMutation,
      variableValues: {
        data: {
          token: user?.resetToken,
          password: "newPassword",
        },
      },
    });

    expect(reset).toMatchObject({
      data: {
        resetPassword: true,
      },
    });
  });

  it("Shouldn't reset password if token is incorrect", async () => {
    const reset = await graphqlCall({
      source: resetPasswordMutation,
      variableValues: {
        data: {
          token: "incorrecttoken",
          password: "newPassword",
        },
      },
    });

    expect(reset).toMatchObject({
      data: {
        resetPassword: false,
      },
    });
  });

  it("Shouldn't reset password if password is less than 8 characters", async () => {
    await graphqlCall({
      source: passwordResetRequestMutation,
      variableValues: {
        email: "ed@example.com",
      },
    });

    const user = await User.findOne({ where: { email: "ed@example.com" } });

    const reset = await graphqlCall({
      source: resetPasswordMutation,
      variableValues: {
        data: {
          token: user?.resetToken,
          password: "pass",
        },
      },
    });

    expect(reset).toMatchObject({
      data: null,
    });
  });
});
