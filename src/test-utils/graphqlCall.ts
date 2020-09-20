import { graphql } from "graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { buildSchema } from "type-graphql";
import { RequestResolver } from "../resolver/request";
import { UserResolver } from "../resolver/user";

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
}

export const graphqlCall = async ({ source, variableValues }: Options) => {
  return graphql({
    schema: await buildSchema({
      resolvers: [UserResolver, RequestResolver],
      validate: false,
    }),
    source,
    variableValues,
  });
};
