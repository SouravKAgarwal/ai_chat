import { apiSlice } from "../api/apiSlices";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateAvatar: builder.mutation({
      query: (avatar) => ({
        url: "user/update/avatar",
        method: "PUT",
        body: { avatar },
        credentials: "include",
      }),
    }),
    updateProfile: builder.mutation({
      query: ({ name, criteria }) => ({
        url: "user/update",
        method: "PUT",
        body: { name, criteria },
        credentials: "include",
      }),
    }),
    updatePassword: builder.mutation({
      query: ({ oldPassword, newPassword }) => ({
        url: "user/update/password",
        method: "PUT",
        body: { oldPassword, newPassword },
        credentials: "include",
      }),
    }),
    getUsers: builder.query({
      query: () => ({
        url: "user/all-users",
        method: "GET",
        credentials: "include",
      }),
    }),
    updateUserRole: builder.mutation({
      query: ({ email, role }) => ({
        url: "user/update/role",
        method: "PUT",
        body: { email, role },
        credentials: "include",
      }),
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `user/delete/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = userApi;
