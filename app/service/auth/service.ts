import bcrypt from "bcryptjs";
import { generateTokens } from "../token/service";
import { v4 as uuidv4 } from "uuid";
import { dynamoDb } from "../../config/db.config";
import { validateEmail } from "../../model/dto/user.dto";
import {
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

export const signUp = async (email: string, password: string): Promise<any> => {
  try {
    const uuid: string = uuidv4();
    const user = await validateEmail(uuid, email, password);

    if (!user) {
      throw {
        code: 409,
        message: `Email:${email} is not email or password lenght less than 8 digits`,
      };
    }

    const hashedPassword = bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(+process.env.PASSWORD_SALT_DATA!)
    );

    const tokens = generateTokens({ uuid, email, hashedPassword });

    const scanCommandToFindCandidateUser: ScanCommand = new ScanCommand({
      TableName: process.env.USERS_TABLE!,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: email },
      },
    });

    const candidateUser = await dynamoDb.send(scanCommandToFindCandidateUser);

    if (candidateUser.Count! >= 1) {
      throw {
        code: 409,
        message: `User with this email:${email} already exist`,
      };
    }

    const putCommantForInsertTokens: PutItemCommand = new PutItemCommand({
      TableName: process.env.TOKENS_TABLE!,
      Item: {
        id: { S: uuid },
        access_token: { S: tokens.access_token },
        refresh_token: { S: tokens.refresh_token },
      },
    });

    await dynamoDb.send(putCommantForInsertTokens);

    const putCommantForInsertUser: PutItemCommand = new PutItemCommand({
      TableName: process.env.USERS_TABLE!,
      Item: {
        id: { S: uuid },
        email: { S: email },
        password: { S: hashedPassword },
      },
    });

    await dynamoDb.send(putCommantForInsertUser);

    return { user, tokens };
  } catch (error: any) {
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<any> => {
  try {
    const scanCommandToFindCandidateUser: ScanCommand = new ScanCommand({
      TableName: process.env.USERS_TABLE!,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: email },
      },
    });

    const candidateUser = await dynamoDb.send(scanCommandToFindCandidateUser);

    if (candidateUser.Count! < 1) {
      throw {
        code: 400,
        message: `No user with email:${email}, please check your email`,
      };
    }

    const userHashedPassword = candidateUser.Items![0].password.S!;

    const userId = candidateUser.Items![0].id.S!;

    const comparePasswords = bcrypt.compareSync(password, userHashedPassword);

    if (!comparePasswords) {
      throw {
        code: 400,
        message: `Password for email:${email} is incorrecnt`,
      };
    }
    const tokens = generateTokens({
      uuid: userId,
      email,
      hashedPassword: userHashedPassword,
    });

    const updateCommdandForInsertTokens: UpdateItemCommand =
      new UpdateItemCommand({
        TableName: process.env.TOKENS_TABLE!,
        Key: {
          id: { S: userId },
        },
        UpdateExpression:
          "SET access_token = :access_token, refresh_token = :refresh_token",
        ExpressionAttributeValues: {
          ":access_token": { S: tokens.access_token },
          ":refresh_token": { S: tokens.refresh_token },
        },
        ReturnValues: "ALL_NEW",
      });

    await dynamoDb.send(updateCommdandForInsertTokens);

    const user = await validateEmail(userId, email, password);
    return {
      user,
      tokens,
    };
  } catch (error: any) {
    throw error;
  }
};
