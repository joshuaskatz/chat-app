import { graphqlCall } from "../../../test-utils/graphqlCall";
import { Connection } from "typeorm";
import { testConn } from "../../../test-utils/testConn";
import { registerMutation } from "../../source/user";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
  await graphqlCall({
    source: registerMutation,
    variableValues: {
      data: {
        username: "jacobkatz",
        email: "jacob@example.com",
        password: "password",
      },
    },
  });
});

afterAll(async () => {
  await conn.close();
});

describe("Register", () => {
  it("Should create a user", async () => {
    const user = await graphqlCall({
      source: registerMutation,
      variableValues: {
        data: {
          username: "joshuaskatz",
          email: "josh@example.com",
          password: "password",
        },
      },
    });

    expect(user).toMatchObject({
      data: {
        register: {
          user: {
            username: "joshuaskatz",
            email: "josh@example.com",
          },
        },
      },
    });
  });

  it("Shouldn't create user if username exists", async () => {
    const user = await graphqlCall({
      source: registerMutation,
      variableValues: {
        data: {
          username: "jacobkatz",
          email: "jake@example.com",
          password: "password",
        },
      },
    });

    expect(user).toMatchObject({
      data: null,
    });
  });

  it("Shouldn't create user if email exists", async () => {
    const user = await graphqlCall({
      source: registerMutation,
      variableValues: {
        data: {
          username: "jacobakatz",
          email: "jacob@example.com",
          password: "password",
        },
      },
    });

    expect(user).toMatchObject({
      data: null,
    });
  });

  it("Shouldn't create a user if username is less than 6 characters", async () => {
    const user = await graphqlCall({
      source: registerMutation,
      variableValues: {
        data: {
          username: "eli",
          email: "eli@example.com",
          password: "password",
        },
      },
    });

    expect(user).toMatchObject({
      data: null,
    });
  });

  it("Shouldn't create a user if email is not valid", async () => {
    const user = await graphqlCall({
      source: registerMutation,
      variableValues: {
        data: {
          username: "eli",
          email: "eli",
          password: "password",
        },
      },
    });

    expect(user).toMatchObject({
      data: null,
    });
  });

  it("Shouldn't create a user if password is less than 8 characters", async () => {
    const user = await graphqlCall({
      source: registerMutation,
      variableValues: {
        data: {
          username: "eli",
          email: "eli@example.com",
          password: "pass",
        },
      },
    });

    expect(user).toMatchObject({
      data: null,
    });
  });
});
