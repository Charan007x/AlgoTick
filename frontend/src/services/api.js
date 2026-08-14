import axios from "axios";

function getApiUrl() {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  const onLan =
    process.env.NODE_ENV !== "production" &&
    hostname !== "localhost" &&
    hostname !== "127.0.0.1";

  if (onLan) {
    const protocol = window.location.protocol;
    return `${protocol}//${hostname}:5000/api`;
  }

  return process.env.REACT_APP_API_URL || "http://localhost:5000/api";
}

const API_URL = getApiUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post("/auth/signup", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),
};

// Questions API
export const questionsAPI = {
  addQuestion: (data) => api.post("/questions", data),
  getQuestions: (params) => api.get("/questions", { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  markRevised: (id) => api.put(`/questions/${id}/revise`),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  getDashboardStats: (params) =>
    api.get("/questions/stats/dashboard", { params }),
  getLeetCodeActivity: () => api.get("/questions/leetcode-activity"),
};

// Lists API
export const listsAPI = {
  getLists: () => api.get("/lists"),
  createList: (data) => api.post("/lists", data),
  getList: (id) => api.get(`/lists/${id}`),
  updateList: (id, data) => api.put(`/lists/${id}`, data),
  deleteList: (id) => api.delete(`/lists/${id}`),
  addQuestionToList: (id, data) => api.post(`/lists/${id}/add-question`, data),
  removeQuestionFromList: (id, questionNumber) =>
    api.delete(`/lists/${id}/questions/${questionNumber}`),
  addQuestionToToday: (id, data) =>
    api.post(`/lists/${id}/add-question-to-today`, data),
  addAllToToday: (id) => api.post(`/lists/${id}/add-all-to-today`),
};

// Notes API
export const notesAPI = {
  getNotes: () => api.get("/notes"),
  getNote: (id) => api.get(`/notes/${id}`),
  createNote: (formData) => {
    return api.post("/notes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateNote: (id, formData) => {
    return api.put(`/notes/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

// AI Coach API
export const aiCoachAPI = {
  getDashboard: () => api.get("/ai-coach/dashboard"),
  refresh: () => api.post("/ai-coach/refresh"),
};

// Algorithms API
export const algorithmsAPI = {
  getAll: () => api.get("/algorithms"),
  getOne: (id) => api.get(`/algorithms/${id}`),
  create: (data) => api.post("/algorithms", data),
  refresh: (id) => api.put(`/algorithms/${id}/refresh`),
  delete: (id) => api.delete(`/algorithms/${id}`),
  createFolder: (data) => api.post("/algorithms/folders", data),
  updateFolder: (id, data) => api.put(`/algorithms/folders/${id}`, data),
  deleteFolder: (id) => api.delete(`/algorithms/folders/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAsUnread: (id) => api.put(`/notifications/${id}/unread`),
  markAllAsRead: () => api.put("/notifications/mark-all-read"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete("/notifications"),

  // Admin routes
  createNotification: (data) => api.post("/notifications/admin/create", data),
  getAllNotifications: () => api.get("/notifications/admin/all"),
  deleteNotificationPermanently: (id) =>
    api.delete(`/notifications/admin/${id}`),
  getUsers: () => api.get("/notifications/admin/users"),
};

export default api;
