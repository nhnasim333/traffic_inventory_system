import { baseApi } from "../../api/baseApi";

const dropsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDrops: builder.query({
      query: () => ({ url: "/drops", method: "GET" }),
      providesTags: ["drops"],
    }),
    getDropById: builder.query({
      query: (id) => ({ url: `/drops/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "drops", id }],
    }),
    createDrop: builder.mutation({
      query: (data) => ({
        url: "/drops",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["drops"],
    }),
  }),
});

export const { useGetDropsQuery, useGetDropByIdQuery, useCreateDropMutation } =
  dropsApi;
