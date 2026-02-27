import { baseApi } from "../../api/baseApi";

const reservationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReservation: builder.mutation({
      query: (data) => ({
        url: "/reservations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["reservations", "drops"],
    }),
    getMyReservations: builder.query({
      query: () => ({ url: "/reservations/my", method: "GET" }),
      providesTags: ["reservations"],
    }),
  }),
});

export const { useCreateReservationMutation, useGetMyReservationsQuery } =
  reservationsApi;
