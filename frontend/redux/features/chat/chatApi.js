import { apiSlice } from "../api/apiSlices";

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: ({ userId, prompt, file, image }) => ({
        url: "chat",
        method: "POST",
        body: {
          userId,
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
    getChatsByUserId: builder.query({
      query: ({ userId }) => ({
        url: `chat/user/${userId}`,
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
  useDeleteChatMutation,
} = chatApi;
