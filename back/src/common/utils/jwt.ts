import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { JwtPayload } from "../types/auth.js";

export function signToken(payload: JwtPayload) {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
