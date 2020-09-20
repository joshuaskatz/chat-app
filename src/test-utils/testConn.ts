import { User } from "../entity/User";
import { Request } from "../entity/Request";
import { createConnection } from "typeorm";

export const testConn = (drop: boolean = false) => {
  return createConnection({
    type: "postgres",
    username: "postgres",
    password: "postgres",
    database: "chat-test",
    synchronize: drop,
    dropSchema: drop,

    entities: [User, Request],
  });
};
