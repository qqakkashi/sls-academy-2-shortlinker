import bcrypt from "bcryptjs";
import tokenService from "./token.service";
import { v4 as uuidv4 } from "uuid";
import { dynamoDb } from "../config/db.config";
import { validateEmail } from "../model/dto/user.dto";

class AuthService {
  async signUp(email: string, password: string): Promise<any> {
    try {
      const uuid: string = uuidv4();
      const hashedPassword = bcrypt.hashSync(
        password,
        bcrypt.genSaltSync(+process.env.PASSWORD_SALT_DATA!)
      );
      const user = await validateEmail(uuid, email, hashedPassword);
      if (!user) {
        throw {
          code: 409,
          message: `Email:${email} is not email`,
        };
      }
      const tokens = tokenService.generateTokens(uuid);
      const candidateUser = await dynamoDb
        .scan({
          TableName: process.env.USERS_TABLE!,
          FilterExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": email,
          },
        })
        .promise();
      if (candidateUser.Count! >= 1) {
        throw {
          code: 409,
          message: `User with this email:${email} already exist`,
        };
      }
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

      return { user, tokens };
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    const candidateUser = await dynamoDb
      .scan({
        TableName: process.env.USERS_TABLE!,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
      })
      .promise();
    if (candidateUser.Count! < 1) {
      throw {
        code: 400,
        message: `No user with email:${email}, please check your email`,
      };
    }
    const userHashedPassword = candidateUser.Items?.[0].password;
    const userId = candidateUser.Items?.[0].id;

    const comparePasswords = bcrypt.compareSync(password, userHashedPassword);
    if (!comparePasswords) {
      throw {
        code: 400,
        message: `Password for email:${email} is incorrecnt`,
      };
    }
    const newTokens = tokenService.generateTokens(userId);

    const insertTokens = await dynamoDb
      .update({
        TableName: process.env.TOKENS_TABLE!,
        Key: {
          id: userId,
        },
        UpdateExpression:
          "SET access_token = :access_token, refresh_token = :refresh_token",
        ExpressionAttributeValues: {
          ":access_token": newTokens.access_token,
          ":refresh_token": newTokens.refresh_token,
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();
    const userAccessToken = newTokens.access_token;
    const userRefreshToken = newTokens.refresh_token;
    return {
      user: { id: userId, email },
      tokens: {
        access_token: userAccessToken,
        refresh_token: userRefreshToken,
      },
    };
  }
}

export default new AuthService();
