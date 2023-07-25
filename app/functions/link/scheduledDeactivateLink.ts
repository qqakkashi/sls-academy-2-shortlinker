import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDb } from "../../config/db.config";
import { MessageUtil } from "../../utils/message.util";

export const handler = async ({ id }: { id: string }) => {
  try {
    const deleteCommandForDeactivateLink: DeleteItemCommand =
      new DeleteItemCommand({
        TableName: process.env.LINKS_TABLE!,
        Key: {
          id: { S: id },
        },
      });

    await dynamoDb.send(deleteCommandForDeactivateLink);
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.code, error.message);
  }
};
