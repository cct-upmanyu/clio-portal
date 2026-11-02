import { baseApi } from "./baseApi";

// Task: { id, matterId, title, description, due ("YYYY-MM-DD" or null), priority, status, completedAt,
// assignedBy, assignees? }. The firm gets every assignee's progress; a client only their own status.
const CHANGES = ["Tasks", "Dashboard", "Activity"];

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Admin Console ----
    getMatterTasks: builder.query({
      query: (crmMatterId) => `/admin/matters/${crmMatterId}/tasks`,
      transformResponse: (response) => response.data.tasks,
      providesTags: ["Tasks"],
    }),
    // Open tasks across every matter, soonest due first (each with its matter)
    getTasksDueSoon: builder.query({
      query: (limit = 10) => `/admin/tasks/due-soon?limit=${limit}`,
      transformResponse: (response) => response.data.tasks,
      providesTags: ["Tasks"],
    }),
    // { crmMatterId, subject, description?, dueDate?, priority, assigneeIds }
    createTask: builder.mutation({
      query: ({ crmMatterId, ...body }) => ({ url: `/admin/matters/${crmMatterId}/tasks`, method: "POST", body }),
      transformResponse: (response) => response.data.task,
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),
    // { taskId, subject?, description?, dueDate?, priority?, assigneeIds? }
    updateTask: builder.mutation({
      query: ({ taskId, ...body }) => ({ url: `/admin/tasks/${taskId}`, method: "PATCH", body }),
      transformResponse: (response) => response.data.task,
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),
    // { taskId, userIds? }: done for those assignees, or everyone
    completeTask: builder.mutation({
      query: ({ taskId, userIds }) => ({ url: `/admin/tasks/${taskId}/complete`, method: "POST", body: userIds ? { userIds } : {} }),
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),
    reopenTask: builder.mutation({
      query: ({ taskId, userIds }) => ({ url: `/admin/tasks/${taskId}/reopen`, method: "POST", body: userIds ? { userIds } : {} }),
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),
    cancelTask: builder.mutation({
      query: (taskId) => ({ url: `/admin/tasks/${taskId}/cancel`, method: "POST" }),
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),

    // ---- Client portal ----
    getMyTasks: builder.query({
      query: (crmMatterId) => `/matters/${crmMatterId}/tasks`,
      transformResponse: (response) => response.data.tasks,
      providesTags: ["Tasks"],
    }),
    completeMyTask: builder.mutation({
      query: ({ crmMatterId, taskId }) => ({ url: `/matters/${crmMatterId}/tasks/${taskId}/complete`, method: "POST" }),
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),
  }),
});

export const {
  useGetMatterTasksQuery, useGetTasksDueSoonQuery, useCreateTaskMutation, useUpdateTaskMutation,
  useCompleteTaskMutation, useReopenTaskMutation, useCancelTaskMutation,
  useGetMyTasksQuery, useCompleteMyTaskMutation,
} = taskApi;
