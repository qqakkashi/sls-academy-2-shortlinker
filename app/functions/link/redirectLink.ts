import {
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { dynamoDb } from "../../config/db.config";
import { MessageUtil } from "../../utils/message.util";
import { sendSQSMessage } from "../../service/sqs/service";

export const handler = async (event: any) => {
  try {
    const { shortlink } = event.pathParameters;

    const scanCommandForLinkInfo: ScanCommand = new ScanCommand({
      TableName: process.env.LINKS_TABLE!,
      FilterExpression: "short_link = :link",
      ExpressionAttributeValues: {
        ":link": { S: shortlink },
      },
    });

    const linkInfo = await dynamoDb.send(scanCommandForLinkInfo);

    if (linkInfo.Count! < 1) {
      return MessageUtil.error(404, "This link was deactivated or not created");
    }

    const fullLink = linkInfo.Items![0].full_link.S!;

    if (linkInfo.Items![0].one_time_link.BOOL! === true) {
      console.log(linkInfo.Items![0]);

      const deleteCommandForLink: DeleteItemCommand = new DeleteItemCommand({
        TableName: process.env.LINKS_TABLE!,
        Key: {
          id: { S: linkInfo.Items![0].id.S! },
        },
      });

      await dynamoDb.send(deleteCommandForLink);

      await sendSQSMessage({
        email: linkInfo.Items![0].email.S!,
        message: `Link with id ${linkInfo.Items![0].id.S!} deactivated`,
      });
      return {
        statusCode: 302,
        headers: {
          Location: String(fullLink),
        },
        body: "",
      };
    } else {
      const updateCommandForIncrementRedirectCount = new UpdateItemCommand({
        TableName: process.env.LINKS_TABLE!,
        Key: {
          id: { S: linkInfo.Items![0].id.S! },
        },
        UpdateExpression: "SET click_count = :click_count",
        ExpressionAttributeValues: {
          ":click_count": { N: `${+linkInfo.Items![0].click_count.N! + 1}` },
        },
        ReturnValues: "ALL_NEW",
      });

      await dynamoDb.send(updateCommandForIncrementRedirectCount);

      return {
        statusCode: 302,
        headers: {
          Location: String(fullLink),
        },
        body: "",
      };
    }
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.number, error.message);
  }
};
