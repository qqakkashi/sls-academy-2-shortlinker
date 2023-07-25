import { DeleteItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDb } from "../../config/db.config";
import { MessageUtil } from "../../utils/message.util";

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
      const deleteCommandForLink: DeleteItemCommand = new DeleteItemCommand({
        TableName: process.env.LINKS_TABLE!,
        Key: {
          id: linkInfo.Items![0].id,
        },
      });
      await dynamoDb.send(deleteCommandForLink);
    }
    return {
      statusCode: 302,
      headers: {
        Location: String(fullLink),
      },
      body: "",
    };
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.number, error.message);
  }
};
