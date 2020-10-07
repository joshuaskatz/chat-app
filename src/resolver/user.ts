import {
  Resolver,
  Query,
  ObjectType,
  Field,
  InputType,
  Mutation,
  Arg,
  UseMiddleware,
  Ctx,
  Int,
} from "type-graphql";
import { User } from "../entity/User";
import { hash, compare } from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import { isAuth } from "../utils/isAuth";
import { MyContext } from "../MyContext";
import { v4 as uuid4 } from "uuid";
import { mailToken } from "../utils/mailToken";
import { MoreThanOrEqual, getRepository, getConnection, Like } from "typeorm";

@ObjectType()
class AuthResponse {
  @Field() token: string;

  @Field() user: User;
}

@ObjectType()
export class MyFriendsResponse {
  @Field() id: number;

  @Field() username: string;
}

@InputType()
class LoginInput {
  @Field() email: string;

  @Field() password: string;
}

@InputType()
class RegisterInput extends LoginInput {
  @Field() username: string;
}

@InputType()
class ResetPasswordInput {
  @Field() token: string;

  @Field() password: string;
}

@Resolver(User)
export class UserResolver {
  @Query(() => [MyFriendsResponse])
  @UseMiddleware(isAuth)
  async myFriends(
    @Ctx() { authPayload }: MyContext
  ): Promise<MyFriendsResponse[] | unknown[]> {
    const { userId } = authPayload!;

    return getConnection().query(
      `
      SELECT public.user.id, public.user.username 
      FROM public.friends 
      INNER JOIN public.user 
      ON public.friends.friend = public.user.id
      WHERE public.friends.user = $1
    `,
      [userId]
    );
  }

  @Query(() => [MyFriendsResponse])
  @UseMiddleware(isAuth)
  async mutualFriends(
    @Arg("user", () => Int) user: number,
    @Ctx() { authPayload }: MyContext
  ): Promise<MyFriendsResponse[] | unknown[]> {
    const { userId } = authPayload!;

    const mutual = await getConnection().query(
      `
      SELECT public.user.id, public.user.username 
      FROM public.friends 
      INNER JOIN public.user 
      ON public.friends.friend = public.user.id
      WHERE public.friends.user IN ($1, $2) 
    `,
      [userId, user]
    );

    let mutualFriends: number[] = [];
    let list: { [key: string]: number } = {};
    mutual.forEach((f: User) => (list[f.id] ? ++list[f.id] : (list[f.id] = 1)));
    for (let key in list) {
      if (list[key] === 2) {
        mutualFriends.push(parseInt(key));
      }
    }

    return User.findByIds(mutualFriends);
  }

  //Return all users but the authorized user.
  @Query(() => [User])
  @UseMiddleware(isAuth)
  async users(
    @Arg("query", () => String, { nullable: true }) query: string,
    @Ctx() { authPayload }: MyContext
  ): Promise<User[]> {
    const { userId } = authPayload;
    let users: User[];
    if (query) {
      users = await User.find({
        relations: ["friends"],
        where: { username: Like(`%${query}%`) },
      });
    } else {
      users = await User.find({ relations: ["friends"] });
    }

    return users.filter((u: User) => u.id !== userId);
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  async me(@Ctx() { authPayload }: MyContext): Promise<User | undefined> {
    const { userId } = authPayload!;

    return User.findOne({
      where: { id: userId },
      relations: ["friends", "requests", "chatrooms"],
    });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async removeFriend(
    @Arg("user", () => Int) user: number,
    @Ctx() { authPayload }: MyContext
  ): Promise<Boolean> {
    const { userId } = authPayload!;

    const friends = await getRepository("friends").delete([
      {
        user: userId,
        friend: user,
      },
      {
        user: user,
        friend: userId,
      },
    ]);

    if (friends.affected! < 2) {
      return false;
    }

    return true;
  }

  @Mutation(() => AuthResponse)
  async register(
    @Arg("data", () => RegisterInput) data: RegisterInput
  ): Promise<AuthResponse> {
    if (data.username.length < 6) {
      throw new Error("Username must be at least 6 characters");
    }
    if (!data.email.includes("@")) {
      throw new Error("Must be a valid email.");
    }
    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const hashedPassword = await hash(data.password, 12);

    let user;
    try {
      user = await User.create({
        ...data,
        password: hashedPassword,
      }).save();
    } catch (err) {
      if (err.detail.includes("already exists")) {
        throw new Error("Username or email is already in use.");
      }
    }

    //Cast as User b/c user could be undefined if try/catch fails.
    return {
      token: generateToken((user as User).id),
      user: user as User,
    };
  }

  @Mutation(() => AuthResponse)
  async login(
    @Arg("data", () => LoginInput) data: LoginInput
  ): Promise<AuthResponse> {
    const user = await User.findOne({ where: { email: data.email } });

    if (!user) {
      throw new Error("Username and password do not match.");
    }

    const verifyPassword = await compare(data.password, user.password);

    if (!verifyPassword) {
      throw new Error("Username and password do not match.");
    }

    return {
      token: generateToken(user.id),
      user,
    };
  }

  @Mutation(() => Boolean)
  async requestResetPassword(
    @Arg("email", () => String) email: string
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return false;
    }

    const resetToken = uuid4();
    const resetTokenExpiry = Date.now() + 3600000;

    await User.update({ email }, { resetToken, resetTokenExpiry });

    await mailToken(resetToken, email);

    return true;
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Arg("data", () => ResetPasswordInput) data: ResetPasswordInput
  ): Promise<Boolean | undefined> {
    const user = await User.findOne({
      where: {
        resetToken: data.token,
        resetTokenExpiry: MoreThanOrEqual(Date.now() - 3600000),
      },
    });

    if (!user) {
      return false;
    }

    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const hashedPassword = await hash(data.password, 12);

    await User.update(
      { resetToken: data.token },
      {
        password: hashedPassword,
        resetToken: undefined,
        resetTokenExpiry: undefined,
      }
    );

    return true;
  }
}
