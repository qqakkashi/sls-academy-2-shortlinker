import { Handler } from "aws-lambda";
import AuthController from "./controllers/auth.controller";

export const signup: Handler = async (event, context, callback): Promise<any> =>
  AuthController.signUp(event);

export const app: Handler = (event, context, callback): any =>
  AuthController.app(event);
