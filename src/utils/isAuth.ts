import { MiddlewareFn } from "type-graphql";
import { MyContext } from "src/MyContext";
import { verify } from "jsonwebtoken";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const auth = context.req.headers["authorization"];

  if (!auth) {
    throw new Error("Not authenticated!");
  }

  try {
    const token = auth.split(" ")[1];
    const authPayload = verify(token, process.env.JWT_SECRET);
    context.authPayload = authPayload as any;
  } catch (err) {
    throw new Error("Not authenticated!");
  }

  return next();
};
