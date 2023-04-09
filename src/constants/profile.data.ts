import axios from 'axios';
import {
  CFProblemRating,
  CFProblemTag,
  CFRating,
  GithubGraphsOutput,
  GithubLanguage,
  GithubStatistics,
  GithubStreakGraph,
  LeetcodeGraphsOutput,
  Repository,
} from 'src/graphql.types';

const GET_CONTRIBUTION_GRAPH_QUERY = `query ($userName: String!) {
  user(login: $userName) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}`;

/**
 * It takes a Github token as an argument and returns the Github username associated with that token
 * @param {string} githubToken - The token that we got from the Github OAuth flow.
 * @returns The username of the user who is logged in.
 */
export const getGithubUsername = async (githubToken: string) => {
  try {
    const response = await axios.get(`https://api.github.com/user`, {
      headers: { Authorization: `token ${githubToken}` },
    });
    return response.data.login;
  } catch (error) {
    throw new Error('An error occurred while fetching data from Github');
  }
};

interface GithubCalendarData {
  totalContributions: number;
  weeks: [{ contributionDays: [{ contributionCount: number; date: Date }] }];
}

/**
 * It takes a Github username and a Github token as arguments, and returns a promise that resolves to
 * the Github contribution graph data
 * @param {string} githubUsername - The username of the Github user whose contribution graph you want to fetch.
 * @param {string} githubToken - This is the token was generated from the users Github account.
 * @returns GithubCalendarData
 */
export const getGithubContributionGraph = async (
  githubUsername: string,
  githubToken: string,
): Promise<GithubCalendarData> => {
  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query: GET_CONTRIBUTION_GRAPH_QUERY,
        variables: { userName: githubUsername },
      },
      { headers: { Authorization: `Bearer ${githubToken}` } },
    );
    return response.data.data.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while fetching data from Github');
  }
};

const LEETCODE_CONTRIBUTION_GRAPH_QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submissionCalendar    
  }
}`;

/**
 * It makes a POST request to the Leetcode GraphQL API with the username as a variable, and returns the submission calendar data
 * @param {string} leetcodeUsername - The username of the user whose contribution graph you want to
 * fetch.
 * @returns An array of objects containing the date and the number of submissions on that date.
 */
export const getLeetcodeContributionGraph = async (
  leetcodeUsername: string,
) => {
  try {
    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: LEETCODE_CONTRIBUTION_GRAPH_QUERY,
        variables: { username: leetcodeUsername },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': '*',
        },
      },
    );
    const res = response.data.data.matchedUser;
    const calendar = res.submissionCalendar;
    const data = JSON.parse(calendar);
    return data;
  } catch (error) {
    throw new Error('Incorrect Leetcode username');
  }
};

enum CodeforcesVerdict {
  OK = 'OK',
  PARTIAL = 'PARTIAL',
  WRONG_ANSWER = 'WRONG_ANSWER',
  TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  IDLENESS_LIMIT_EXCEEDED = 'IDLENESS_LIMIT_EXCEEDED',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  PRESENTATION_ERROR = 'PRESENTATION_ERROR',
  CHALLENGED = 'CHALLENGED',
  SKIPPED = 'SKIPPED',
  TESTING = 'TESTING',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  COMPILATION_ERROR = 'COMPILATION_ERROR',
  SECURITY_VIOLATED = 'SECURITY_VIOLATED',
  CRASHED = 'CRASHED',
  INPUT_PREPARATION_CRASHED = 'INPUT_PREPARATION_CRASHED',
}

interface CodeforcesSubmission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: {
    contestId: number;
    index: string;
    name: string;
    type: string;
    rating: number;
    tags: string[];
  };
  author: {
    contestId: number;
    members: string[];
    participantType: string;
    ghost: boolean;
    startTimeSeconds: number;
  };
  programmingLanguage: string;
  verdict: CodeforcesVerdict;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}
/**
 * It takes a Codeforces username as an argument and returns an array of submissions made by that user
 * @param {string} codeforcesUsername - The username of the user whose submissions you want to fetch.
 * @returns An array of CodeforcesSubmission objects
 */

export const getCodeforcesContributionGraph = async (
  codeforcesUsername: string,
) => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${codeforcesUsername}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': '*',
        },
      },
    );
    const submissions: CodeforcesSubmission[] = response.data.result;
    return submissions;
  } catch (error) {
    throw new Error('Incorrect Codeforces username');
  }
};

const GET_PINNED_REPOS = `
query($userName: String!) {
  user(login: $userName) {
    pinnedItems(first: 6, types: [REPOSITORY]) {
      nodes {
        ... on Repository {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
        }
      }
    }
  }
}
`;

/**
 * It takes a GitHub username and a GitHub token, and returns a list of pinned repositories for that
 * user
 * @param {string} username - The username of the user whose pinned repos you want to fetch.
 * @param {string} githubToken - This is the token that you get from the GitHub API.
 * @returns An array of Repository objects
 */
export const pinnedRepos = async (
  username: string,
  githubToken: string,
): Promise<Repository[]> => {
  const response = await axios.post(
    'https://api.github.com/graphql',
    { query: GET_PINNED_REPOS, variables: { userName: username } },
    { headers: { Authorization: `Bearer ${githubToken}` } },
  );
  return response.data.data.user.pinnedItems.nodes;
};

/**
 * It takes a Codeforces username as a parameter and returns an array of CFRating objects
 * @param {string} codeforcesUsername - The username of the user whose rating graph you want to fetch.
 * @returns CFRating[]
 */
export const getCFRatingGraph = async (
  codeforcesUsername: string,
): Promise<CFRating[]> => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${codeforcesUsername}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': '*',
        },
      },
    );
    if (response.data?.result) {
      for (const rating of response.data.result) {
        rating.date = new Date(rating.ratingUpdateTimeSeconds * 1000);
      }
    }
    return response.data.result;
  } catch (error) {
    throw new Error('Incorrect Codeforces username');
  }
};
/**
 * It takes a Codeforces username as input and returns an object containing an array of tags and an
 * array of ratings
 * @param {string} codeforcesUsername - The username of the user whose submissions you want to fetch.
 * @returns An object with two arrays, one for tags and one for ratings
 */

export const getCFTagandProblemGraph = async (
  codeforcesUsername: string,
): Promise<{
  tagArray: CFProblemTag[];
  ratingArray: CFProblemRating[];
}> => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${codeforcesUsername}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': '*',
        },
      },
    );
    const submissions: CodeforcesSubmission[] = response.data.result;
    const tagMap = new Map<string, number>();
    const ratingMap = new Map<number, number>();
    submissions.forEach((submission) => {
      if (submission.verdict === CodeforcesVerdict.OK) {
        submission.problem.tags.forEach((tag) => {
          if (tagMap.has(tag)) {
            tagMap.set(tag, tagMap.get(tag) + 1);
          } else {
            tagMap.set(tag, 1);
          }
        });
        if (submission.problem.rating !== undefined) {
          if (ratingMap.has(submission.problem.rating)) {
            ratingMap.set(
              submission.problem.rating,
              ratingMap.get(submission.problem.rating) + 1,
            );
          } else ratingMap.set(submission.problem.rating, 1);
        }
      }
    });
    const tagArray: CFProblemTag[] = [];
    const ratingArray: CFProblemRating[] = [];
    tagMap.forEach((value, key) =>
      tagArray.push({ tagName: key, problemsCount: value }),
    );
    ratingMap.forEach((value, key) =>
      ratingArray.push({ difficulty: key, problemsCount: value }),
    );
    tagArray.sort((a, b) => b.problemsCount - a.problemsCount);
    ratingArray.sort((a, b) => a.difficulty - b.difficulty);
    return { tagArray, ratingArray };
  } catch (error) {
    throw new Error('Incorrect Codeforces username');
  }
};

const GITHUB_GRAPH_DATA = `
query userInfo($userName: String!) {
  user(login: $userName) {
    followers {
      totalCount
    }
    following {
      totalCount
    }
    repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
      totalCount
      nodes {
        name
        forkCount
        languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
          edges {
            size
            node {
              color
              name
            }
          }
        }
        watchers {
          totalCount
        }
        refs(first: 50, refPrefix: "refs/heads/") {
          nodes {
            name
            target {
              ... on Commit {
                history {
                  totalCount
                }
              }
            }
          }
        }
      }
    }
    starredRepositories {
      nodes {
        stargazerCount
      }
    }
    issues {
      totalCount
    }
    repositoriesContributedTo {
      totalCount
    }
    pullRequests {
      totalCount
    }
    pullRequests {
      nodes {
        reviews {
          totalCount
        }
      }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}`;

/**
 * It takes a GitHub username and a GitHub token, and returns an object containing the user's language
 * graph, statistics graph, and streak graph
 * @param {string} githubUsername - The username of the user you want to get the data for.
 * @param {string} githubToken - This is the token that you get from the github developer settings.
 * @returns GithubGraphsOutput
 */
export const getGithubGraphsTogether = async (
  githubUsername: string,
  githubToken: string,
): Promise<GithubGraphsOutput> => {
  const response = await axios.post(
    'https://api.github.com/graphql',
    {
      query: GITHUB_GRAPH_DATA,
      variables: { userName: githubUsername },
    },
    { headers: { Authorization: `Bearer ${githubToken}` } },
  );
  const languageColorMap = new Map<string, string>();
  const languageMap = new Map<string, number>();
  response.data.data.user.repositories.nodes.forEach((repo: any) => {
    repo.languages.edges.forEach((edge: any) => {
      if (languageColorMap.has(edge.node.name) === false) {
        languageColorMap.set(edge.node.name, edge.node.color);
      }
      if (languageMap.has(edge.node.name)) {
        languageMap.set(
          edge.node.name,
          languageMap.get(edge.node.name) + edge.size,
        );
      } else {
        languageMap.set(edge.node.name, edge.size);
      }
    });
  });
  const languageArray: GithubLanguage[] = [];
  languageMap.forEach((value, key) => {
    languageArray.push({
      name: key,
      size: value,
      color: languageColorMap.get(key),
    });
  });
  languageArray.sort((a, b) => b.size - a.size);

  let currentStreak = 0;
  let longestStreak = 0;
  let longestStreakStart = new Date();
  let longestStreakEnd = new Date();
  let currentStreakStart = new Date();
  response.data.data.user.contributionsCollection.contributionCalendar.weeks.forEach(
    (week: any) => {
      week.contributionDays.forEach((day: any) => {
        if (day.contributionCount > 0) {
          if (currentStreak === 0) {
            currentStreakStart = new Date(day.date);
          }
          currentStreak += 1;
          if (currentStreak === 1) {
            currentStreakStart = new Date(day.date);
          }
        } else {
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
            longestStreakStart = currentStreakStart;
            longestStreakEnd = new Date(day.date);
          }
          currentStreak = 0;
        }
      });
    },
  );
  const githubStreakGraph: GithubStreakGraph = {
    totalContributions:
      response.data.data.user.contributionsCollection.contributionCalendar
        .totalContributions,
    longestStreakLength: longestStreak,
    longestStreakStartDate: longestStreakStart,
    longestStreakEndDate: longestStreakEnd,
    currentSteakLength: currentStreak,
    currentStreakStartDate: currentStreakStart,
  };
  const githubStats: GithubStatistics = {
    followers: response.data.data.user.followers.totalCount,
    following: response.data.data.user.following.totalCount,
    repos: response.data.data.user.repositories.totalCount,
    issues: response.data.data.user.issues.totalCount,
    commits: response.data.data.user.repositories.nodes.reduce(
      (acc, curr) =>
        acc +
        curr.refs.nodes.reduce(
          (acc, curr) =>
            acc +
            (curr.name === 'master' || curr.name === 'main'
              ? curr.target.history.totalCount
              : 0),
          0,
        ),
      0,
    ),
    contributedTo: response.data.data.user.repositoriesContributedTo.totalCount,
    pullRequests: response.data.data.user.pullRequests.totalCount,
    pullRequestReviews: response.data.data.user.pullRequests.nodes.reduce(
      (acc, curr) => acc + curr.reviews.totalCount,
      0,
    ),
    forkedBy: response.data.data.user.repositories.nodes.reduce(
      (acc, curr) => acc + curr.forkCount,
      0,
    ),
    watchedBy: response.data.data.user.repositories.nodes.reduce(
      (acc, curr) => acc + curr.watchers.totalCount,
      0,
    ),
  };
  const githubGraphs: GithubGraphsOutput = {
    languageGraph: languageArray,
    statsGraph: githubStats,
    streakGraph: githubStreakGraph,
  };
  return githubGraphs;
};

const LEETCODE_GRAPHS_QUERY = `
query data($username: String!) {
  problems: allQuestionsCount { 
    difficulty 
    count 
  }
  user: matchedUser(username: $username) {
    username
    profile { 
      realname: realName 
      about: aboutMe 
      avatar: userAvatar 
      skills: skillTags 
      country: countryName 
      ranking
      categoryDiscussCount
      solutionCount
      reputation
      postViewCount
    }
    languageProblemCount {
      languageName
      problemsSolved
    }
    tagProblemCounts {
      advanced {
        tagName
        tagSlug
        problemsSolved
      }
      intermediate {
        tagName
        tagSlug
        problemsSolved
      }
      fundamental {
        tagName
        tagSlug
        problemsSolved
      }
    }
    problemsSolvedBeatsStats {
      difficulty
      percentage
    }
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
  contest: userContestRanking(username: $username) {
    rating
    ranking: globalRanking
    attendedContestsCount
    totalParticipants
    topPercentage
  }
  contestHistory: userContestRankingHistory(username: $username) {
    attended
    problemsSolved
    totalProblems
    rating
    ranking
    contest {
      title
      startTime
    }
  }
}
`;

/**
 * It makes a POST request to the Leetcode GraphQL API, and returns the data in a more readable format
 * @param {string} leetcodeUsername - The username of the user you want to get the graphs for.
 * @returns LeetcodeGraphsOutput
 */
export const getLeetcodeGraphs = async (
  leetcodeUsername: string,
): Promise<LeetcodeGraphsOutput> => {
  const response = await axios.post(
    'https://leetcode.com/graphql',
    {
      query: LEETCODE_GRAPHS_QUERY,
      variables: { username: leetcodeUsername },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': '*',
      },
    },
  );
  const { problems, user, contest, contestHistory } = response.data.data;
  return {
    problems: problems.map((problem: any) => ({
      difficulty: problem.difficulty,
      count: problem.count,
    })),
    user: {
      username: user.username,
      profile: {
        realname: user.profile.realname,
        about: user.profile.about,
        avatar: user.profile.avatar,
        skills: user.profile.skills,
        country: user.profile.country,
        ranking: user.profile.ranking,
        categoryDiscussCount: user.profile.categoryDiscussCount,
        solutionCount: user.profile.solutionCount,
        reputation: user.profile.reputation,
        postViewCount: user.profile.postViewCount,
      },
      languageProblemCount: user.languageProblemCount.map((language: any) => ({
        languageName: language.languageName,
        problemsSolved: language.problemsSolved,
      })),
      tagProblemCounts: {
        advanced: user.tagProblemCounts.advanced.map((tag: any) => ({
          tagName: tag.tagName,
          tagSlug: tag.tagSlug,
          problemsSolved: tag.problemsSolved,
        })),
        intermediate: user.tagProblemCounts.intermediate.map((tag: any) => ({
          tagName: tag.tagName,
          tagSlug: tag.tagSlug,
          problemsSolved: tag.problemsSolved,
        })),
        fundamental: user.tagProblemCounts.fundamental.map((tag: any) => ({
          tagName: tag.tagName,
          tagSlug: tag.tagSlug,
          problemsSolved: tag.problemsSolved,
        })),
      },
      problemsSolvedBeatsStats: user.problemsSolvedBeatsStats.map(
        (problem: any) => ({
          difficulty: problem.difficulty,
          percentage: problem.percentage,
        }),
      ),
      submitStatsGlobal: user.submitStatsGlobal.acSubmissionNum.map(
        (problem: any) => ({
          difficulty: problem.difficulty,
          count: problem.count,
        }),
      ),
    },
    contest,
    contestHistory:
      contestHistory === null
        ? null
        : contestHistory
            .map((contest: any) => ({
              attended: contest.attended,
              problemsSolved: contest.problemsSolved,
              totalProblems: contest.totalProblems,
              rating: contest.rating,
              ranking: contest.ranking,
              contest: {
                title: contest.contest.title,
                startTime: () => {
                  const date = new Date(
                    parseInt(contest.contest.startTime, 10) * 1000,
                  );
                  return date;
                },
              },
            }))
            .filter((contest: any) => contest.attended)
            .sort((a, b) => a.contest.startTime - b.contest.startTime),
  };
};
