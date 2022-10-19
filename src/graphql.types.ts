
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

export class CheckCodeInput {
    code: string;
    email: string;
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
    isVerified: boolean;
    followedByIds: string[];
    followingIds: string[];
}

export class Token {
    id: string;
    code: string;
    email: string;
    createdAt: DateTime;
}

export class SigninOutput {
    token: string;
    user: User;
}

export class CheckCodeOutptut {
    token: string;
    user: User;
}

export abstract class IMutation {
    abstract signup(input: SignupInput): boolean | Promise<boolean>;

    abstract signin(input: SigninInput): SigninOutput | Promise<SigninOutput>;

    abstract forgotPassword(input: ForgotPasswordInput): boolean | Promise<boolean>;

    abstract resetPassword(input: ResetPasswordInput): boolean | Promise<boolean>;

    abstract checkCode(input: CheckCodeInput): CheckCodeOutptut | Promise<CheckCodeOutptut>;
}

export abstract class IQuery {
    abstract _dummy(): Nullable<string> | Promise<Nullable<string>>;
}

export type DateTime = any;
type Nullable<T> = T | null;
