import jwt from "jsonwebtoken";
import { User } from "../../model/dto/user.dto";
import dotenv from "dotenv";

dotenv.config();

export const generateTokens = (user: {
  uuid: string;
  email: string;
  hashedPassword: string;
}): { access_token: string; refresh_token: string } => {
  const access_token = jwt.sign(user, process.env.JWE_ACCESS_SECRET_WORD!, {
    expiresIn: process.env.JWE_ACCESS_TTL!,
  });
  const refresh_token = jwt.sign(user, process.env.JWE_REFRESH_SECRET_WORD!, {
    expiresIn: process.env.JWE_REFRESH_TTL!,
  });
  return { access_token, refresh_token };
};

export const getUserFromToken = (token: string): User | null => {
  try {
    const access_token = token.split(" ")[1];
    const user = jwt.verify(
      access_token,
      process.env.JWE_ACCESS_SECRET_WORD!
    ) as User;
    return user;
  } catch (error: any) {
    return null;
  }
};
