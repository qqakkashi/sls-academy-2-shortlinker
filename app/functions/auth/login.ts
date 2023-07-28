import { MessageUtil } from "../../utils/message.util";
import { ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDb } from "../../config/db.config";
import { generateTokens } from "../../service/token/service";
import { validateEmail } from "../../model/dto/user.dto";
import bcrypt from "bcryptjs";

export const handler = async (event: any) => {
  try {
    const { email, password } = JSON.parse(event.body);
    if (email === undefined || password === undefined) {
      return MessageUtil.error(409, "Not all reqired fields are filled");
    }

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
    return MessageUtil.success(200, {
      user,
      tokens,
    });
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.code, error.message);
  }
};
