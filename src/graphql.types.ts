/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class SignupInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class SigninInput {
  email: string;
  password: string;
}

export class ForgotPasswordInput {
  email: string;
}

export class ResetPasswordInput {
  password: string;
  confirmPassword: string;
}

export class User {
  id: string;
  name: string;
  email: string;
  profilePicture?: Nullable<string>;
  description?: Nullable<string>;
  codeforcesUsername?: Nullable<string>;
  githubUsername?: Nullable<string>;
  leetcodeUsername?: Nullable<string>;
  createdAt: DateTime;
  updatedAt: DateTime;
  password: string;
  favourites: User[];
}

export abstract class IMutation {
  abstract signup(input: SignupInput): User | Promise<User>;

  abstract signin(input: SigninInput): User | Promise<User>;

  abstract forgotPassword(
    input: ForgotPasswordInput,
  ): boolean | Promise<boolean>;

  abstract resetPassword(input: ResetPasswordInput): boolean | Promise<boolean>;
}

export type DateTime = Date;
type Nullable<T> = T | null;
