import { SQS } from "@aws-sdk/client-sqs";
import dotenv from "dotenv";

dotenv.config();

export const sqsClient = new SQS({ region: process.env.REGION! });
