import jwt from "jsonwebtoken";

export const generateTokens = (user: {
  uuid: string;
  email: string;
  hashedPassword: string;
}) => {
  const access_token = jwt.sign(user, process.env.JWE_ACCESS_SECRET_WORD!, {
    expiresIn: process.env.JWE_ACCESS_TTL!,
  });
  const refresh_token = jwt.sign(user, process.env.JWE_REFRESH_SECRET_WORD!, {
    expiresIn: process.env.JWE_REFRESH_TTL!,
  });
  return { access_token, refresh_token };
};
