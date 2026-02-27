import { baseApi } from "../../api/baseApi";

const purchasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPurchase: builder.mutation({
      query: (data) => ({
        url: "/purchases",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["purchases", "reservations", "drops"],
    }),
    getMyPurchases: builder.query({
      query: () => ({ url: "/purchases/my", method: "GET" }),
      providesTags: ["purchases"],
    }),
  }),
});

export const { useCreatePurchaseMutation, useGetMyPurchasesQuery } =
  purchasesApi;
