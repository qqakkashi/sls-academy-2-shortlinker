import { ListIdentitiesCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../../config/ses.config";
import { signIn } from "../../service/auth/service";
import { MessageUtil } from "../../utils/message.util";

export const handler = async (event: any) => {
  try {
    const { email, password } = JSON.parse(event.body);
    if (email === undefined || password === undefined) {
      return MessageUtil.error(409, "Not all reqired fields are filled");
    }

    const response = await signIn(email, password);
    return MessageUtil.success(200, response);
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.code, error.message);
  }
};
