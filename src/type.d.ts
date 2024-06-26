interface GithubConfig {
  author: string;
  repo: string;
  clientId: string
  clientSecret: string
}


interface GithubResult<T = any> {
  data: any | null;
  error: { message: string; type: string } | null;
}

interface GithubUserItem {
  url: string; // user id
  login: string; // user name
  email: string; // user email
  avatarUrl: string; // user avatar
}
interface GithubCommentReactionGroup {
  content: GithubCommentReactionType;
  users: { totalCount: number };
}

interface GithubCommentItem {
  body: string; // comment content
  bodyHTML: string; // create time
  createdAt: string; // comment url
  id: string;
  url: string;
  author: GithubUserItem;
  reactionGroups: GithubCommentReactionGroup[];
}

interface GithubCommentPageInfo {
  endCursor: string;
  startCursor: string;
  sort: "last" | "first";
}
interface GithubCommentResult {
  nodes: GithubCommentItem[];
  pageInfo: GithubCommentPageInfo;
  totalCount: number;
}

type GithubCommentReactionType =
  | "THUMBS_UP"
  | "THUMBS_DOWN"
  | "HEART"
  | "EYES"
  | "LAUGH"
  | "HOORAY"
  | "CONFUSED"
  | "ROCKET";
