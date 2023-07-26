import { dynamoDb } from "../../config/db.config";

import { sqsClient } from "../../config/sqs.config";
import { getUserFromToken } from "../../service/token/service";
import { MessageUtil } from "../../utils/message.util";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { linkDeactivateService } from "../../service/link/service";
import { PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sendSQSMessage } from "../../service/sqs/service";

dotenv.config();
export const handler = async (event: any) => {
  try {
    const user = getUserFromToken(event.headers.Authorization);

    const { link, expires, oneTimeLink } = JSON.parse(event.body);

    const scanCommandToFindCandidateLink: ScanCommand = new ScanCommand({
      TableName: process.env.LINKS_TABLE!,
      FilterExpression: "full_link = :link",
      ExpressionAttributeValues: {
        ":link": { S: link },
      },
    });

    const candidateLink = await dynamoDb.send(scanCommandToFindCandidateLink);

    const isLinkExists = candidateLink.Items?.some((linkInfo: any) => {
      return user?.email === linkInfo.email.S!;
    });

    if (isLinkExists) {
      return MessageUtil.success(201, {
        link_id: candidateLink.Items![0].id.S!,
        full_link: link,
        short_link: candidateLink.Items![0].short_link.S!,
      });
    }

    const linkId = uuidv4();
    const shortLink = (Math.random() + 1).toString(36).substring(6);
    const createDate = new Date().toISOString();
    const expiresDate = new Date(
      new Date().getTime() + (expires || 1) * 24 * 60 * 60 * 1000
    ).toISOString();

    const putNewShowrtLinkCommand: PutItemCommand = new PutItemCommand({
      TableName: process.env.LINKS_TABLE!,
      Item: {
        id: { S: linkId },
        email: { S: user!.email },
        full_link: { S: link },
        short_link: { S: shortLink },
        create_date: { S: createDate },
        expires_date: { S: expiresDate },
        one_time_link: { BOOL: oneTimeLink || false },
        click_count: { N: "0" },
      },
    });

    await dynamoDb.send(putNewShowrtLinkCommand);

    if (!oneTimeLink) {
      await linkDeactivateService(
        linkId,
        user!.email,
        new Date(expiresDate).toISOString()
      );
      await sendSQSMessage({
        email: user!.email,
        message: `Link with id ${linkId} will be deactivated in ${expiresDate.toString()}`,
      });
    }

    if (oneTimeLink) {
      await sendSQSMessage({
        email: user!.email,
        message: `Link with id ${linkId} will be deactivated after one redirect`,
      });
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        data: {
          link_id: linkId,
          full_link: link,
          short_link: `https://p3ip1pz49f.execute-api.eu-central-1.amazonaws.com/dev/${shortLink}`,
        },
      }),
    };
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.code, error.message);
  }
};
