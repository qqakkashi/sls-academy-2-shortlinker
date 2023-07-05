import bcrypt from "bcryptjs";
import tokenService from "./token.service";
import { v4 as uuidv4 } from "uuid";
import { dynamoDb } from "../config/db.config";

class AuthService {
  async signUp(email: string, password: string): Promise<any> {
    try {
      const uuid: string = uuidv4();
      const hashedPassword = bcrypt.hashSync(
        password,
        bcrypt.genSaltSync(+process.env.PASSWORD_SALT_DATA!)
      );
      const tokens = tokenService.generateTokens({
        email,
        password: hashedPassword,
      });
      const insertUser = await dynamoDb
        .put({
          TableName: process.env.USERS_TABLE!,
          Item: {
            id: uuid,
            email: email,
            password: hashedPassword,
          },
        })
        .promise();
      const insertTokens = await dynamoDb
        .put({
          TableName: process.env.TOKENS_TABLE!,
          Item: {
            id: uuid,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          },
        })
        .promise();
      return { id: uuid, email: email, password: hashedPassword, tokens };
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }
}

export default new AuthService();
