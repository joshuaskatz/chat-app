import "reflect-metadata";
import express from "express";
import { ApolloServer, PubSub } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";

import { UserResolver } from "./resolver/user";
import { User } from "./entity/User";
import { Request } from "./entity/Request";
import { RequestResolver } from "./resolver/request";
import { Chat } from "./entity/Chat";
import { ChatResolver } from "./resolver/chat";
import { ChatRoom } from "./entity/ChatRoom";
import { ChatRoomResolver } from "./resolver/chatroom";

const main = async () => {
  await createConnection({
    type: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    ssl: {
      rejectUnauthorized: false,
    },
    entities: [User, Request, Chat, ChatRoom],
  });

  const app = express();
  const pubsub = new PubSub();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        RequestResolver,
        ChatResolver,
        ChatRoomResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }) => {
      return {
        req,
        res,
        pubsub,
      };
    },
    subscriptions: {
      path: "/subscriptions",
    },
  });

  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  app.listen(process.env.PORT || 4000, () => {
    console.log("Listening on port 4000!");
  });
};

main().catch((e) => console.log(e));
