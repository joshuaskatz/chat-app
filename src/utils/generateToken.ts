import { sign } from "jsonwebtoken";

export const generateToken = (userId: number): string => {
  return sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
