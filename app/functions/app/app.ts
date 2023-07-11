import { MessageUtil } from "../../utils/message.util";

export const handler = async (event: any) => {
  try {
    return MessageUtil.success(200, { message: "server wokring" });
  } catch (error: any) {
    return MessageUtil.error(error.code, error.message);
  }
};
