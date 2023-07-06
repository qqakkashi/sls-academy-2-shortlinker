import { validate, IsEmail, MinLength } from "class-validator";

export class User {
  id!: string;
  @IsEmail()
  email!: string;
  @MinLength(8)
  password?: string;
}

export const validateEmail = async (
  id: string,
  email: string,
  password?: string
): Promise<User | boolean> => {
  const user = new User();
  user.id = id;
  user.email = email;
  user.password = password;
  return validate(user).then((errors) => {
    if (errors.length === 0) {
      return user;
    } else {
      console.error(errors);
      return false;
    }
  });
};
