import { defineStore } from "pinia";
import { GithubComment } from "../lib/github";
import { useRouteQuery } from "@vueuse/router";
import dayjs from "dayjs";
import { getEnv } from "../lib/utils/env";

export const useGithubCommentStore = defineStore("githubCommentStore", () => {
  const { clientId, clientSecret, githubAuthor, githubRepo } = getEnv();
  const _githubCode = useRouteQuery("code", "");
  const _githubComment = reactive(new GithubComment({
    clientId,
    clientSecret,
    repo: githubRepo,
    author: githubAuthor
  }));

  const comments = ref<GithubCommentItem[]>([]);
  const pageInfo = reactive<Partial<GithubCommentPageInfo>>({});
  const commentTotalCount = ref(Infinity);
  const userInfo = ref<Partial<GithubUserItem>>({});
  const isAuthed = computed(() => _githubComment.isAuthed);
  const router = useRouter();
  const quoteComment = ref<Partial<GithubCommentItem>>({})
  const loading = ref(false)


  watch(
    _githubCode,
    async (code) => {
      if (code) {
        await _githubComment.getAccessToken(code);
        router.push("/");
      }
    },
    { immediate: true }
  );

  watch(isAuthed, async () => {
    if (isAuthed.value) {
      await _githubComment.getIssue(1);
      getUserInfo();
      initComments();
    }
  }, { immediate: true });

  // login github authorize
  function loginAuthorize() {
    _githubComment.loginAuthorize();
  }

  function sortComments(data: GithubCommentItem[]) {
    return data.sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    );
  }

  function setPageInfo(result: GithubCommentResult) {
    pageInfo.endCursor = result.pageInfo.endCursor;
    pageInfo.startCursor = result.pageInfo.startCursor;
    commentTotalCount.value = result.totalCount;
  }

  async function initComments() {
    if (!isAuthed.value) return;

    loading.value = true

    const result = await _githubComment.getComments({ sort: "last" });
    comments.value = sortComments(result.nodes);

    setPageInfo(result);
    loading.value = false
  }

  async function updateComments() {
    if (!isAuthed.value) return;

    loading.value = true

    const result = await _githubComment.getComments(pageInfo);
    const newComments = sortComments(result.nodes);
    comments.value = [...comments.value, ...newComments];

    setPageInfo(result);
    loading.value = false

  }

  async function createComment(content: string, id: string) {
    if (!isAuthed.value || !content) return;

    let value = content
    if (quoteComment.value.id) {
      const quoteBody = "@" + quoteComment.value.author?.login + "\n" + quoteComment.value.body?.split("\n").map(str => `> ${str}`).join("\n");
      value = quoteBody + "\n\n" + content;
    }

    const result = await _githubComment.createComment(value, id);
    if (result.errors && result.errors.length > 0) {
      const error = result.errors[0];

      alert(error.message);
      return false;
    }

    return true;
  }

  async function reactionComment(
    commentId: string,
    content: GithubCommentReactionType
  ) {
    if (!isAuthed.value) return;

    _githubComment.reactionComment(commentId, content);
  }

  async function getReactionsComment() {
    // _githubComment.getCommentReactions("")
  }

  async function getUserInfo() {
    if (!isAuthed.value) return;

    userInfo.value = (await _githubComment.getUser()) || {};

    return userInfo.value;
  }

  async function deleteComment(commentId: string) {
    const result = await _githubComment.deleteComment(commentId);
    if (result.error) {
      alert(result.error.message);
    }
    return result.data;
  }

  async function editorComment(commentId: string, content: string) {
    const result = await _githubComment.editorComment(commentId, content);
    if (result.error) {
      alert(result.error.message);
    }

    return result.data;
  }

  function onUpdateComment(comment: GithubCommentItem) {
    const index = comments.value.findIndex((item) => item.id == comment.id);
    if (index !== -1) {
      comments.value[index] = comment;
    }
  }

  function onQuoteComment(comment: GithubCommentItem) {
    quoteComment.value = comment
  }

  function logout() {
    _githubComment.logout();
    window.location.reload();
  }

  return {
    comments,
    commentTotalCount,
    userInfo,
    isAuthed,
    loading,
    initComments,
    updateComments,
    createComment,
    reactionComment,
    getReactionsComment,
    loginAuthorize,
    getUserInfo,
    deleteComment,
    editorComment,
    logout,

    quoteComment,
    onUpdateComment,
    onQuoteComment
  };
});
