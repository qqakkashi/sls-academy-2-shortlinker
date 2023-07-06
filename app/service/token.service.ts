import jwt from "jsonwebtoken";
import { User } from "../model/dto/user.dto";

class TokenService {
  generateTokens(uuid: string) {
    const access_token = jwt.sign(
      { uuid },
      process.env.JWE_ACCESS_SECRET_WORD!,
      {
        expiresIn: process.env.JWE_ACCESS_TTL!,
      }
    );
    const refresh_token = jwt.sign(
      { uuid },
      process.env.JWE_REFRESH_SECRET_WORD!,
      {
        expiresIn: process.env.JWE_REFRESH_TTL!,
      }
    );
    return { access_token, refresh_token };
  }
}

export default new TokenService();
