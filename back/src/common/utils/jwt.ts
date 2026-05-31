import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { JwtPayload } from "../types/auth.js";

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
