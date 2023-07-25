import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generatePolicy = (principalId: string, methodArn: string) => {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: methodArn,
        },
      ],
    },
  };
};

export const handler = async (event: any, context: any, callback: any) => {
  const access_token = event.authorizationToken.split(" ")[1];
  try {
    jwt.verify(
      access_token,
      process.env.JWE_ACCESS_SECRET_WORD!,
      (verifyError: any, user: any) => {
        if (verifyError) {
          console.error(verifyError);
          return callback("Unauthorized");
        }
        const policy = generatePolicy(user?.uuid, event.methodArn);
        return callback(null, policy);
      }
    );
  } catch (err) {
    console.error(err);
    return callback("Unauthorized");
  }
};
