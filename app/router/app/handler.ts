import AppController from "../../controllers/app.controller";
import { Handler } from "aws-lambda";

export const app: Handler = (event, context, callback): any =>
  AppController.app(event);
