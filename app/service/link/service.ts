import {
  CreateScheduleCommand,
  CreateScheduleCommandInput,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";
import dotenv from "dotenv";

dotenv.config();

export const linkDeactivateService = async (
  id: string,
  email: string,
  expireDate: string
) => {
  const scheduler: SchedulerClient = new SchedulerClient({});
  const schedulerParams: CreateScheduleCommandInput = {
    FlexibleTimeWindow: {
      Mode: "OFF",
    },
    Name: id,
    ScheduleExpression: `at(${expireDate.substring(0, 19)})`,
    Target: {
      Arn: `arn:aws:lambda:${process.env.REGION!}:${process.env
        .ACCOUNT_ID!}:function:sls-academy-2-shortlinker-dev-scheduleddeactivate`,
      RoleArn: `arn:aws:iam::${process.env
        .ACCOUNT_ID!}:role/event-bridger-role`,
      Input: JSON.stringify({ id, email }),
    },
    State: "ENABLED",
  };

  await scheduler.send(new CreateScheduleCommand(schedulerParams));
};
