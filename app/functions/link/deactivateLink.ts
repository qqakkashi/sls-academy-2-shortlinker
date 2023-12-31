import { DeleteItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDb } from "../../config/db.config";
import { MessageUtil } from "../../utils/message.util";
import { sendSQSMessage } from "../../service/sqs/service";

export const handler = async (event: any) => {
  try {
    const { shortlink } = JSON.parse(event.body);

    const scanCommandForFindLink: ScanCommand = new ScanCommand({
      TableName: process.env.LINKS_TABLE!,
      FilterExpression: "short_link = :link",
      ExpressionAttributeValues: {
        ":link": { S: shortlink.split("/")[4] },
      },
    });

    const findLink = await dynamoDb.send(scanCommandForFindLink);

    if (findLink.Count! < 1) {
      return MessageUtil.error(404, { message: "Link not found" });
    }

    await sendSQSMessage({
      email: findLink.Items![0].email.S!,
      message: `Short link with id: ${findLink.Items![0].id
        .S!} has been deactivated`,
    });

    const deleteCommandForDeactivateLink: DeleteItemCommand =
      new DeleteItemCommand({
        TableName: process.env.LINKS_TABLE!,
        Key: {
          id: { S: findLink.Items![0].id.S! },
        },
      });

    const deleteLink = await dynamoDb.send(deleteCommandForDeactivateLink);

    if (!deleteLink) {
      return MessageUtil.error(404, { message: "Link not found" });
    }

    return MessageUtil.success(200, { message: "Link deactivated" });
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.code, error.message);
  }
};
