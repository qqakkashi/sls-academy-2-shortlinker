import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDb } from "../../config/db.config";
import { sendSQSMessage } from "../../service/sqs/service";

export const handler = async ({ id, email }: { id: string; email: string }) => {
  try {
    await sendSQSMessage({
      email: email,
      message: `Short link with id: ${id} has been deactivated`,
    });
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
  }
};
