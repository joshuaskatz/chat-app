import { PubSub } from "apollo-server-express";
import { Request, Response } from "express";

export interface MyContext {
  req: Request;
  res: Response;
  pubsub: PubSub;
  authPayload: { userId: number };
}
