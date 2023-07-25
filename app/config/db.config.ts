import { DynamoDB } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

export const dynamoDb = new DynamoDB({ region: process.env.REGION! });
