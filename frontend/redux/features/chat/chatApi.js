import { apiSlice } from "../api/apiSlices";

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: ({ prompt, file, image }) => ({
        url: "chat",
        method: "POST",
        body: {
          prompt,
          file,
          image,
        },
        headers: {
          "Content-Type": undefined,
        },
        credentials: "include",
      }),
    }),
    updateChat: builder.mutation({
      query: ({ chatId, prompt, file, image }) => ({
        url: "chat/update",
        method: "POST",
        body: {
          chatId,
          prompt,
          file,
          image,
        },
        headers: {
          "Content-Type": undefined,
        },
        credentials: "include",
      }),
    }),
    refreshChat: builder.mutation({
      query: ({ chatId, messageIndex }) => ({
        url: "chat/refresh",
        method: "PUT",
        body: {
          chatId,
          messageIndex,
        },
        headers: {
          "Content-Type": undefined,
        },
        credentials: "include",
      }),
    }),
    shareChat: builder.mutation({
      query: ({ chatId }) => ({
        url: "chat/share",
        method: "POST",
        body: {
          chatId,
        },
        credentials: "include",
      }),
    }),
    getShareChat: builder.query({
      query: (shareId) => ({
        url: `chat/share/${shareId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    deleteShareChat: builder.mutation({
      query: (shareId) => ({
        url: `chat/share/${shareId}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
    deleteAllChats: builder.mutation({
      query: () => ({
        url: `chat/all`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
    renameChat: builder.mutation({
      query: ({ chatId, newTitle }) => ({
        url: "chat/rename-title",
        method: "PUT",
        body: {
          chatId,
          newTitle,
        },
        credentials: "include",
      }),
    }),
    archiveChat: builder.mutation({
      query: (chatId) => ({
        url: `chat/archive`,
        method: "PUT",
        body: {
          chatId,
        },
        credentials: "include",
      }),
    }),
    unArchiveChat: builder.mutation({
      query: (chatId) => ({
        url: `chat/unarchive`,
        method: "PUT",
        body: {
          chatId,
        },
        credentials: "include",
      }),
    }),
    getArchivedChats: builder.query({
      query: () => ({
        url: "chat/archived-chats",
        method: "GET",
        credentials: "include",
      }),
    }),
    getChatsByUserId: builder.query({
      query: () => ({
        url: `chat/user`,
        method: "GET",
        credentials: "include",
      }),
    }),
    getChatsById: builder.query({
      query: (chatId) => ({
        url: `chat/${chatId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    deleteChat: builder.mutation({
      query: (chatId) => ({
        url: `chat/${chatId}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateChatMutation,
  useUpdateChatMutation,
  useRefreshChatMutation,
  useGetChatsByUserIdQuery,
  useGetChatsByIdQuery,
  useShareChatMutation,
  useGetShareChatQuery,
  useRenameChatMutation,
  useDeleteChatMutation,
  useDeleteAllChatsMutation,
  useDeleteShareChatMutation,
  useArchiveChatMutation,
  useUnArchiveChatMutation,
  useGetArchivedChatsQuery,
} = chatApi;
