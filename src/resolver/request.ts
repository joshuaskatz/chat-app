import {
  Resolver,
  Mutation,
  UseMiddleware,
  Arg,
  Ctx,
  Int,
  Query,
  ObjectType,
  Field,
} from "type-graphql";
import { isAuth } from "../utils/isAuth";
import { MyContext } from "../MyContext";
import { getConnection } from "typeorm";
import { User } from "../entity/User";
import { v4 as uuid4 } from "uuid";
import { Request } from "../entity/Request";

@ObjectType()
export class MyRequestsResponse {
  @Field() toUser: number;

  @Field() fromUser: number;

  @Field() token: string;
}

@Resolver(Request)
export class RequestResolver {
  @Query(() => [MyRequestsResponse])
  @UseMiddleware(isAuth)
  async myRequests(
    @Ctx() { authPayload }: MyContext
  ): Promise<MyRequestsResponse[]> {
    const { userId } = authPayload!;

    return Request.createQueryBuilder()
      .select(["request.token", "request.fromUser", "request.toUser"])
      .from(Request, "request")
      .where("request.toUser = :userId", { userId })
      .getMany();
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteFriendRequest(
    @Arg("token", () => String) token: string,
    @Ctx() { authPayload }: MyContext
  ): Promise<Boolean> {
    const { userId } = authPayload!;

    const request = await Request.findOne({ token, toUser: userId });

    if (!request) {
      return false;
    }

    await Request.remove(request);
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async acceptFriendRequest(
    @Arg("token", () => String) token: string,
    @Ctx() { authPayload }: MyContext
  ): Promise<Boolean> {
    const { userId } = authPayload!;

    const request = await Request.createQueryBuilder()
      .select("request")
      .from(Request, "request")
      .where("request.token = :token", { token })
      .getOne();

    if (!request) {
      return false;
    }

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into("friends")
      .values([
        { userId_1: userId, userId_2: request?.fromUser },
        { userId_1: request?.fromUser, userId_2: userId },
      ])
      .execute();

    await Request.delete({ token });

    return true;
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async friendRequest(
    @Arg("user", () => Int) user: number,
    @Ctx() { authPayload }: MyContext
  ): Promise<Boolean> {
    const { userId } = authPayload!;

    const userExists = await User.findOne({ where: { id: user } });
    const requestExists = await Request.findOne({
      where: { fromUser: userId, toUser: user },
    });

    if (!userExists || requestExists) {
      return false;
    }
    const token = uuid4();

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Request)
      .values({
        token,
        toUser: user,
        fromUser: userId,
      })
      .execute();

    return true;
  }
}
