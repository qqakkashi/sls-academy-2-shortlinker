import { signUp } from "../../service/auth/service";
import { MessageUtil } from "../../utils/message.util";

export const handler = async (event: any) => {
  try {
    console.log(process.env.USERS_TABLE);
    const { email, password } = JSON.parse(event.body);
    if (email === undefined || password === undefined) {
      return MessageUtil.error(409, "Not all reqired fields are filled");
    }
    const response = await signUp(email, password);
    return MessageUtil.success(201, response);
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.code, error.message);
  }
};
