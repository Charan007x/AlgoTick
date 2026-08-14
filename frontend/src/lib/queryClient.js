import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const queryKeys = {
  notifications: ["notifications"],
  lists: ["lists"],
  list: (id) => ["lists", id],
  notes: ["notes"],
  dashboardStats: (filter = "all") => ["dashboardStats", filter],
  leetcodeActivity: ["leetcodeActivity"],
  questions: (params = {}) => ["questions", params],
  aiCoach: ["aiCoach"],
};
