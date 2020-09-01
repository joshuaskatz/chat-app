import { InputType, Field } from "type-graphql";

//Input types are used for args.
@InputType()
export class UsernamePasswordInput {
  @Field() username: string;

  @Field() password: string;

  @Field() email: string;
}
