import {
  ListIdentitiesCommand,
  SendEmailCommand,
  VerifyEmailIdentityCommand,
} from "@aws-sdk/client-ses";
import { sesClient } from "../../config/ses.config";
import { MessageUtil } from "../../utils/message.util";

export const handler = async (event: any) => {
  try {
    const { body } = event.Records[0];
    const { message, email } = JSON.parse(body);
    console.log(body, 1);

    const listIdentitiesResponse = await sesClient.send(
      new ListIdentitiesCommand({})
    );

    const verifiedEmails = listIdentitiesResponse.Identities ?? [];

    if (!verifiedEmails.includes(email)) {
      await sesClient.send(
        new VerifyEmailIdentityCommand({ EmailAddress: email })
      );
      console.log(`Email ${email} has been verified.`);
    } else {
      console.log(`Email ${email} is already verified.`);
    }

    const emailParams = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Text: {
            Data: message,
          },
        },
        Subject: {
          Data: "Notification - Post Deactivation",
        },
      },
      Source: email,
    };

    await sesClient.send(new SendEmailCommand(emailParams));
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.code, error.message);
  }
};
