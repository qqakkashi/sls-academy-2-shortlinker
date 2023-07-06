import { Handler } from "aws-lambda";
import AuthController from "./controllers/auth.controller";
import AppController from "./controllers/app.controller";

export const signup: Handler = async (event, context, callback): Promise<any> =>
  AuthController.signUp(event);

export const signin: Handler = async (event, context, callback): Promise<any> =>
  AuthController.signIn(event);

export const app: Handler = (event, context, callback): any =>
  AppController.app(event);
