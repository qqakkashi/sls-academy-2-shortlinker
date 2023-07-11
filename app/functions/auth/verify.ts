import jwt from "jsonwebtoken";
import { MessageUtil } from "../../utils/message.util";

const generatePolicy = (principalId: any, effect: any, resource: any) => {
  const authResponse = {} as any;
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {} as any;
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne = {} as any;
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

export const handler = async (event: any, context: any, callback: any) => {
  const access_token = event.headers.Authorization.split(" ")[1];
  try {
    jwt.verify(
      access_token,
      process.env.JWE_ACCESS_SECRET_WORD!,
      (verifyError: any, user: any) => {
        if (verifyError) {
          return callback("Unauthorized");
        }
        return callback(
          null,
          generatePolicy(user?.uuid, "Allow", event.methodArn)
        );
      }
    );
  } catch (err) {
    return callback("Unauthorized");
  }
};
