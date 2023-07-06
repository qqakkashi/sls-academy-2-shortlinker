import { Message, MessageUtil } from "../utils/message.util";

class AppController {
  async app(event: any): Promise<Message> {
    try {
      return MessageUtil.success(200, { message: "server wokring" });
    } catch (error: any) {
      return MessageUtil.error(error.code, error.message);
    }
  }
}

export default new AppController();
