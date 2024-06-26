export function getIssueQuery({
  owner,
  repo,
  issueId,
}: {
  owner: string;
  repo: string;
  issueId: number;
}) {
  return `\
    query getIssueById {
      repository(owner: "${owner}", name: "${repo}") {
        issue (number: ${issueId}) {
          id
          number
          title
          body
          url
        }
      }
    }`;
}

export function getCommentsQuery({
  endCursor = "",
  startCursor = "",
  sort = "last",
}: Partial<GithubCommentPageInfo>) {
  let offset = "";

  if (sort === "first") {
    offset = endCursor ? `after: "${endCursor}"` : "";
  } else if (sort === "last") {
    offset = startCursor ? `before: "${startCursor}"` : "";
  }

  return `\
  query getComments(
  $owner: String!
  $repo: String!
  $issueId: Int!
  $perPage: Int!
  ) {
  repository(owner: $owner, name: $repo) {
  issue(number: $issueId) {
    comments(
      ${sort}: $perPage
      ${offset}
    ) {
      totalCount
      pageInfo {
        endCursor
        startCursor
      }
      nodes {
        id
        body
        bodyHTML
        createdAt
        updatedAt
        url
        author {
          avatarUrl
          login
          url
        }
        reactionGroups {
          users (first: 0) {
            totalCount
          }
          content
        }
      }
    }
  }
  }
  }`;
}

export function createCommentQuery() {
  return `\
  mutation postComment(
    $issueNodeId: ID!
    $content: String!
  ) {
    addComment(
      input: {
        subjectId: $issueNodeId
        body: $content
      }
    ) {
      commentEdge {
        node {
          id
          body
          bodyHTML
          createdAt
          updatedAt
          author {
            avatarUrl
            login
            url
          }
          reactionGroups {
            users (first: 0) {
              totalCount
            }
            content
          }
        }
      }
    }
  }`;
}

export function editorCommentQuery() {
  return `\
  mutation putComment(
    $commentId: ID!,
    $content: String!,
  ) {
    updateIssueComment(input: {
      id: $commentId
      body: $content
    }) {
      issueComment {
        id
        body
        bodyHTML
        createdAt
        updatedAt
        author {
          avatarUrl
          login
          url
        }
        reactionGroups {
          users (first: 0) {
            totalCount
          }
          content
        }
      }
    }
  }`;
}

export function deleteCommentQuery() {
  return `\
  mutation deleteComment(
    $commentId: ID!,
  ) {
    deleteIssueComment(input: {
      id: $commentId
    }) {
      clientMutationId
    }
  }`;
}

export function reactionComment() {
  return `\
  mutation postCommentReaction(
    $commentId: ID!,
    $content: ReactionContent!,
  ) {
    addReaction(input: {
      subjectId: $commentId
      content: $content
    }) {
      reaction {
        databaseId
      }
    }
  }`;
}

export function getReactionsComment() {
  return `\
  query getComments(
    $owner: String!
    $repo: String!
    $issueId: Int!
    $perPage: Int!
  ) {
    repository(owner: $owner, name: $repo) {
      issue(number: $issueId) {
        comments(
          last: $perPage
        ) {
          nodes {
            id
            reactionGroups {
              users (first: 0) {
                totalCount
              }
              content
            }
          }
        }
      }
    }
  }`;
}

export function getUserQuery() {
  return `\
  query getUser {
    viewer {
      login
      avatarUrl
      url
      email
    }
  }`;
}

export const GithubCommentApiQuery = {
  get: getCommentsQuery,
  create: createCommentQuery,
  editor: editorCommentQuery,
  delete: deleteCommentQuery,
  reaction: reactionComment,
  getReactions: getReactionsComment,
};
