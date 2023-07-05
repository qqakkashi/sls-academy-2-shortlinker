import jwt from "jsonwebtoken";

class TokenService {
  generateTokens(payload: { email: string; password: string }) {
    const access_token = jwt.sign(
      payload,
      process.env.JWE_ACCESS_SECRET_WORD!,
      {
        expiresIn: process.env.JWE_ACCESS_TTL!,
      }
    );
    const refresh_token = jwt.sign(
      payload,
      process.env.JWE_REFRESH_SECRET_WORD!,
      {
        expiresIn: process.env.JWE_REFRESH_TTL!,
      }
    );
    return { access_token, refresh_token };
  }
}

export default new TokenService();
