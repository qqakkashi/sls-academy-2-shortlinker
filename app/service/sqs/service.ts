import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../../config/sqs.config";
import { MessageUtil } from "../../utils/message.util";

export const sendSQSMessage = async ({
  email,
  message,
}: {
  email: string;
  message: string;
}) => {
  try {
    const sendSQSMessageCommand: SendMessageCommand = new SendMessageCommand({
      MessageBody: JSON.stringify({
        email: email,
        message: message,
      }),
      QueueUrl: `https://sqs.${process.env.REGION!}.amazonaws.com/${process.env
        .ACCOUNT_ID!}/${process.env.QUEUE_NAME!}`,
    });

    await sqsClient.send(sendSQSMessageCommand);
  } catch (error: any) {
    return MessageUtil.error(error.code, error.message);
  }
};
