import { baseApi } from "./baseApi";

// Timelines, newest first. Each page is { events, info: { per_page, count, more_records } }; the next
// page is the events before the last one shown.
const pages = {
  initialPageParam: "",
  getNextPageParam: (lastPage) => (lastPage.info?.more_records ? lastPage.events.at(-1)?.id : undefined),
};
const withCursor = (path, perPage, pageParam) => `${path}?per_page=${perPage}${pageParam ? `&before=${pageParam}` : ""}`;

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Admin Console: every matter and account event. Arg: { perPage }
    getFirmActivity: builder.infiniteQuery({
      infiniteQueryOptions: pages,
      query: ({ queryArg, pageParam }) => withCursor("/admin/activity", queryArg?.perPage ?? 250, pageParam),
      transformResponse: (response) => response.data,
      providesTags: ["Activity"],
    }),
    // Admin Console: one matter's full timeline. Arg: crmMatterId
    getAdminMatterActivity: builder.infiniteQuery({
      infiniteQueryOptions: pages,
      query: ({ queryArg, pageParam }) => withCursor(`/admin/matters/${queryArg}/activity`, 250, pageParam),
      transformResponse: (response) => response.data,
      providesTags: ["Activity"],
    }),
    // Client portal: one of the client's matters, events visible to clients only. Arg: crmMatterId
    getMatterActivity: builder.infiniteQuery({
      infiniteQueryOptions: pages,
      query: ({ queryArg, pageParam }) => withCursor(`/matters/${queryArg}/activity`, 250, pageParam),
      transformResponse: (response) => response.data,
      providesTags: ["Activity"],
    }),
  }),
});

export const {
  useGetFirmActivityInfiniteQuery,
  useGetAdminMatterActivityInfiniteQuery,
  useGetMatterActivityInfiniteQuery,
} = activityApi;
