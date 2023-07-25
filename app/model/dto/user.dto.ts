import { validate, IsEmail, MinLength } from "class-validator";

export class User {
  uuid!: string;
  @IsEmail()
  email!: string;
  @MinLength(8)
  password!: string;
}

export const validateEmail = async (
  uuid: string,
  email: string,
  password: string
): Promise<{ uuid: string; email: string } | boolean> => {
  const user = new User();
  user.uuid = uuid;
  user.email = email;
  user.password = password;
  return validate(user).then((errors) => {
    if (errors.length === 0) {
      return { uuid: user.uuid, email: user.email };
    } else {
      console.error(errors);
      return false;
    }
  });
};
