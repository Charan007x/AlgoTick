import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Questions API
export const questionsAPI = {
  addQuestion: (data) => api.post('/questions', data),
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  markRevised: (id) => api.put(`/questions/${id}/revise`),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  getDashboardStats: () => api.get('/questions/stats/dashboard'),
};

export default api;
