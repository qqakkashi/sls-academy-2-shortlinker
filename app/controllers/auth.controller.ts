import { AWSError } from "aws-sdk";
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
      return MessageUtil.success(response);
    } catch (error: any) {
      return MessageUtil.error(error.code, error.message);
    }
  }

  async app(event: any): Promise<Message> {
    try {
      return MessageUtil.success({ message: "server wokring" });
    } catch (error: any) {
      console.error("Error listing tables:", error as AWSError);
      return MessageUtil.error(error.code, error.message);
    }
  }
}

export default new AuthController();
