import authService from "../service/auth.service";
import { Message, MessageUtil } from "../utils/message.util";

class AuthController {
  async signUp(event: any): Promise<Message> {
    try {
      const { email, password } = JSON.parse(event.body);
      if (email === undefined || password === undefined) {
        return MessageUtil.error(409, "Not all reqired fields are filled");
      }
      const response = await authService.signUp(email, password);
      return MessageUtil.success(201, response);
    } catch (error: any) {
      return MessageUtil.error(error.code, error.message);
    }
  }

  async signIn(event: any): Promise<Message> {
    try {
      const { email, password } = JSON.parse(event.body);
      if (email === undefined || password === undefined) {
        return MessageUtil.error(409, "Not all reqired fields are filled");
      }
      const response = await authService.signIn(email, password);
      return MessageUtil.success(200, response);
    } catch (error: any) {
      return MessageUtil.error(error.code, error.message);
    }
  }
}

export default new AuthController();
