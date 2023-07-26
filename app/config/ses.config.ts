import { SES } from "@aws-sdk/client-ses";
import dotenv from "dotenv";

dotenv.config();

export const sesClient = new SES({ region: process.env.REGION! });
