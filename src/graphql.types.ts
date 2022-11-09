
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum NotificationType {
    FOLLOWING = "FOLLOWING"
}

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

export class UserIdInput {
    userId: string;
}

export class SeeNotificationInput {
    notificationId: string;
}

export class SeeNotificationsInput {
    notificationIds: string[];
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

export class PaginatedUserInput {
    userId: string;
    page?: Nullable<number>;
}

export class DescriptionInput {
    description: string;
}

export class User {
    id: string;
    name: string;
    email: string;
    profilePicture?: Nullable<string>;
    profilePicturePublicId?: Nullable<string>;
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

    abstract seeNotification(input: SeeNotificationInput): string | Promise<string>;

    abstract seeNotifications(input: SeeNotificationsInput): string | Promise<string>;

    abstract authorizeGithub(input?: Nullable<FakeInput>): AuthorizeGithubOutput | Promise<AuthorizeGithubOutput>;

    abstract addUsername(input: AddUsernameInput): string | Promise<string>;

    abstract toggleFollow(input: ToggleFollowInput): string | Promise<string>;

    abstract addDescription(input: DescriptionInput): string | Promise<string>;
}

export class ClistContest {
    duration: number;
    start: DateTime;
    end: DateTime;
    event: string;
    host: string;
    href: string;
    id: string;
    resource: string;
    resource_id: number;
}

export class GetContestOutput {
    today: ClistContest[];
    tomorrow: ClistContest[];
    week: ClistContest[];
    upcoming: ClistContest[];
}

export abstract class IQuery {
    abstract getContests(): GetContestOutput | Promise<GetContestOutput>;

    abstract contributionGraph(input: UserIdInput): ContributionGraph | Promise<ContributionGraph>;

    abstract getPinnedRepos(input: UserIdInput): Repository[] | Promise<Repository[]>;

    abstract codeforcesGraphs(input: UserIdInput): Nullable<CodeforcesGraphsOutput> | Promise<Nullable<CodeforcesGraphsOutput>>;

    abstract githubGraphs(input: UserIdInput): Nullable<GithubGraphsOutput> | Promise<Nullable<GithubGraphsOutput>>;

    abstract leetcodeGraphs(input: UserIdInput): Nullable<LeetcodeGraphsOutput> | Promise<Nullable<LeetcodeGraphsOutput>>;

    abstract notifications(): NotificationOutput | Promise<NotificationOutput>;

    abstract getUser(): RestrictedUserSelf | Promise<RestrictedUserSelf>;

    abstract getUserById(input: UserIdInput): RestrictedUserOther | Promise<RestrictedUserOther>;

    abstract search(input: SearchInput): RestrictedUserOther[] | Promise<RestrictedUserOther[]>;

    abstract getFollowers(input: PaginatedUserInput): RestrictedUserOther[] | Promise<RestrictedUserOther[]>;

    abstract getFollowing(input: PaginatedUserInput): RestrictedUserOther[] | Promise<RestrictedUserOther[]>;
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

export class Language {
    name: string;
    color: string;
}

export class Repository {
    name: string;
    description?: Nullable<string>;
    url: string;
    stargazerCount: number;
    forkCount: number;
    primaryLanguage: Language;
}

export class CFRating {
    contestId: number;
    contestName: string;
    handle: string;
    rank: number;
    oldRating: number;
    newRating: number;
    date: DateTime;
}

export class CFRatingGraph {
    ratings: CFRating[];
}

export class CFProblemRating {
    difficulty: number;
    problemsCount: number;
}

export class CFBarGraph {
    problemRatingGraph: CFProblemRating[];
}

export class CFProblemTag {
    tagName: string;
    problemsCount: number;
}

export class CFDonutGraph {
    problemTagGraph: CFProblemTag[];
}

export class CodeforcesGraphsOutput {
    ratingGraph: CFRatingGraph;
    barGraph: CFBarGraph;
    donutGraph: CFDonutGraph;
}

export class GithubStreakGraph {
    currentSteakLength: number;
    longestStreakLength: number;
    longestStreakStartDate: DateTime;
    longestStreakEndDate: DateTime;
    currentStreakStartDate: DateTime;
    totalContributions: number;
}

export class GithubLanguage {
    name: string;
    color: string;
    size: number;
}

export class GithubStatistics {
    followers: number;
    following: number;
    repos: number;
    forkedBy: number;
    watchedBy: number;
    commits: number;
    issues: number;
    contributedTo: number;
    pullRequests: number;
    pullRequestReviews: number;
}

export class GithubGraphsOutput {
    streakGraph: GithubStreakGraph;
    languageGraph: GithubLanguage[];
    statsGraph: GithubStatistics;
}

export class LcContest {
    rating: number;
    ranking?: Nullable<number>;
    attendedContestsCount: number;
    totalParticipants: number;
    topPercentage: number;
}

export class LcDifficulty {
    difficulty: string;
    count: number;
}

export class LcProfile {
    realname: string;
    about?: Nullable<string>;
    avatar?: Nullable<string>;
    skills: string[];
    country?: Nullable<string>;
    ranking?: Nullable<number>;
    categoryDiscussCount: number;
    solutionCount: number;
    reputation: number;
    postViewCount: number;
}

export class LcLanguageProblemCount {
    languageName: string;
    problemsSolved: number;
}

export class LcTagProblems {
    tagName: string;
    tagSlug: string;
    problemsSolved: number;
}

export class LcTagProblemCount {
    advanced: LcTagProblems[];
    intermediate: LcTagProblems[];
    fundamental: LcTagProblems[];
}

export class LcProblemsSolvedBeatsStats {
    difficulty: string;
    percentage?: Nullable<number>;
}

export class LcSubmitStatsGlobal {
    difficulty: string;
    count: number;
}

export class LcUser {
    username: string;
    profile: LcProfile;
    languageProblemCount: LcLanguageProblemCount[];
    tagProblemCounts: LcTagProblemCount;
    problemsSolvedBeatsStats: LcProblemsSolvedBeatsStats[];
    submitStatsGlobal: LcSubmitStatsGlobal[];
}

export class LcHistoryContest {
    title: string;
    startTime: DateTime;
}

export class LcContestHistory {
    attended: boolean;
    problemsSolved: number;
    totalProblems: number;
    rating: number;
    ranking: number;
    contest: LcHistoryContest;
}

export class LeetcodeGraphsOutput {
    contest?: Nullable<LcContest>;
    contestHistory?: Nullable<LcContestHistory[]>;
    problems: LcDifficulty[];
    user: LcUser;
}

export class UserAvatar {
    id: string;
    name: string;
    profilePicture?: Nullable<string>;
    description?: Nullable<string>;
}

export class Notification {
    id: string;
    description: string;
    createdAt: DateTime;
    seenAt?: Nullable<DateTime>;
    seenStatus: boolean;
    User?: Nullable<UserAvatar>;
    notificationType: NotificationType;
    OtherUser?: Nullable<UserAvatar>;
}

export class NotificationOutput {
    notifications: Notification[];
    unseenNotifications: number;
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
    isFollowing: boolean;
}

export type DateTime = any;
type Nullable<T> = T | null;
