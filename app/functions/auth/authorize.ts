import { MessageUtil } from "../../utils/message.util";
import { dynamoDb } from "../../config/db.config";
import { PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { validateEmail } from "../../model/dto/user.dto";
import { generateTokens } from "../../service/token/service";

export const handler = async (event: any) => {
  try {
    const { email, password } = JSON.parse(event.body);
    if (email === undefined || password === undefined) {
      return MessageUtil.error(409, "Not all reqired fields are filled");
    }
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

    return MessageUtil.success(201, { user });
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.code, error.message);
  }
};
