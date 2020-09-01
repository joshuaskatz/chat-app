import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUserLoader } from "./loaders/UserLoader";

export type MyContext = {
  //& sign joins two types together
  req: Request & { session: Express.Session };
  res: Response;
  redis: Redis;
  //ReturnType will give us return value of a function
  userLoader: ReturnType<typeof createUserLoader>;
};
