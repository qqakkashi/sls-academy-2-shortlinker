import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { MessageUtil } from "../../utils/message.util";
import { dynamoDb } from "../../config/db.config";
import { getUserFromToken } from "../../service/token/service";

export const handler = async (event: any) => {
  try {
    const access_token = event.headers.Authorization;

    const user = getUserFromToken(access_token);

    const ScanCommandForFindingUserLinks = new ScanCommand({
      TableName: process.env.LINKS_TABLE!,
      FilterExpression: "email = :userEmail",
      ExpressionAttributeValues: {
        ":userEmail": { S: user?.email! },
      },
    });

    const userLinks = await dynamoDb.send(ScanCommandForFindingUserLinks);

    if (userLinks.Count! < 1) {
      return MessageUtil.error(404, { message: "User not found" });
    }

    const userLinksFormated = userLinks.Items!.map((linkInfo: any) => {
      return {
        id: linkInfo.id.S,
        full_link: linkInfo.full_link.S,
        short_link:
          "https://p3ip1pz49f.execute-api.eu-central-1.amazonaws.com/dev/" +
          linkInfo.short_link.S,
        create_date: linkInfo.create_date.S,
        expires_date: linkInfo.expires_date.S,
        one_time_link: linkInfo.one_time_link.S,
        click_count: linkInfo.click_count.N,
      };
    });

    return MessageUtil.success(200, userLinksFormated);
  } catch (error: any) {
    console.error(error);
    return MessageUtil.error(error.code, error.message);
  }
};
