import { Handler } from "aws-lambda";
import AuthController from "../../controllers/auth.controller";

export const signup: Handler = async (event, context, callback): Promise<any> =>
  AuthController.signUp(event);

export const signin: Handler = async (event, context, callback): Promise<any> =>
  AuthController.signIn(event);
