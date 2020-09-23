import { graphql } from "graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { ChatResolver } from "../resolver/chat";
import { ChatRoomResolver } from "../resolver/chatroom";
import { buildSchema } from "type-graphql";
import { RequestResolver } from "../resolver/request";
import { UserResolver } from "../resolver/user";

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
  token?: string;
}

export const graphqlCall = async ({
  source,
  variableValues,
  token,
}: Options) => {
  return graphql({
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        RequestResolver,
        ChatResolver,
        ChatRoomResolver,
      ],
      validate: false,
      authChecker: ({ context: { req } }) => {
        return !!req.headers["authorization"];
      },
    }),
    source,
    variableValues,
    //Access req on the context, for resolvers that require auth.
    contextValue: {
      req: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    },
  });
};
