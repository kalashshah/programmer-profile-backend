
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Website {
    CODEFORCES = "CODEFORCES",
    LEETCODE = "LEETCODE"
}

export enum ToggleAction {
    ADD = "ADD",
    REMOVE = "REMOVE"
}

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
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
}

export class CheckCodeInput {
    code: string;
    email: string;
}

export class AddUsernameInput {
    username: string;
    platform: Website;
}

export class FakeInput {
    _?: Nullable<boolean>;
}

export class SearchInput {
    query: string;
    page?: Nullable<number>;
}

export class ToggleFollowInput {
    userId: string;
    action: ToggleAction;
}

export class User {
    id: string;
    name: string;
    email: string;
    profilePicture?: Nullable<string>;
    description?: Nullable<string>;
    codeforcesUsername?: Nullable<string>;
    githubToken?: Nullable<string>;
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
    abstract signup(input: SignupInput): string | Promise<string>;

    abstract signin(input: SigninInput): SigninOutput | Promise<SigninOutput>;

    abstract forgotPassword(input: ForgotPasswordInput): string | Promise<string>;

    abstract resetPassword(input: ResetPasswordInput): string | Promise<string>;

    abstract checkCode(input: CheckCodeInput): CheckCodeOutptut | Promise<CheckCodeOutptut>;

    abstract authorizeGithub(input?: Nullable<FakeInput>): AuthorizeGithubOutput | Promise<AuthorizeGithubOutput>;

    abstract addUsername(input: AddUsernameInput): string | Promise<string>;

    abstract toggleFollow(input: ToggleFollowInput): string | Promise<string>;
}

export class Contribution {
    date: DateTime;
    githubContributions?: Nullable<number>;
    codeforcesContributions?: Nullable<number>;
    leetcodeContributions?: Nullable<number>;
}

export class ContributionGraph {
    totalContributions: number;
    totalGithubContributions?: Nullable<number>;
    totalCodeforcesContributions?: Nullable<number>;
    totalLeetcodeContributions?: Nullable<number>;
    contributions: Contribution[];
}

export abstract class IQuery {
    abstract contributionGraph(input?: Nullable<FakeInput>): ContributionGraph | Promise<ContributionGraph>;

    abstract getUser(): User | Promise<User>;

    abstract search(input: SearchInput): RestrictedUserOther[] | Promise<RestrictedUserOther[]>;
}

export class GithubAuth {
    id: string;
    state: string;
    createdAt: DateTime;
    userId: string;
}

export class AuthorizeGithubOutput {
    state: string;
    url: string;
}

export class RestrictedUserSelf {
    id: string;
    name: string;
    email: string;
    profilePicture?: Nullable<string>;
    description?: Nullable<string>;
    codeforcesUsername?: Nullable<string>;
    leetcodeUsername?: Nullable<string>;
    githubToken?: Nullable<string>;
}

export class RestrictedUserOther {
    id: string;
    name: string;
    email: string;
    profilePicture?: Nullable<string>;
    description?: Nullable<string>;
    codeforcesUsername?: Nullable<string>;
    leetcodeUsername?: Nullable<string>;
}

export type DateTime = any;
type Nullable<T> = T | null;
