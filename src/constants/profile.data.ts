import axios from 'axios';
import { Repository } from 'src/graphql.types';

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

const LEETCODE_CONTRIBUTION_GRAPH_QUERY = `query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submissionCalendar    
  }
}`;

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
      { headers: { 'Content-Type': 'application/json' } },
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

export const getCodeforcesContributionGraph = async (
  codeforcesUsername: string,
) => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${codeforcesUsername}`,
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
