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
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, 
      response.data?.list ? { questionsCount: response.data.list.questions?.length } : 'OK');
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.data);
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

// Lists API
export const listsAPI = {
  getLists: () => api.get('/lists'),
  createList: (data) => api.post('/lists', data),
  getList: (id) => api.get(`/lists/${id}`),
  updateList: (id, data) => api.put(`/lists/${id}`, data),
  deleteList: (id) => api.delete(`/lists/${id}`),
  addQuestionToList: (id, data) => api.post(`/lists/${id}/add-question`, data),
  removeQuestionFromList: (id, questionNumber) => api.delete(`/lists/${id}/questions/${questionNumber}`),
  addQuestionToToday: (id, data) => api.post(`/lists/${id}/add-question-to-today`, data),
  addAllToToday: (id) => api.post(`/lists/${id}/add-all-to-today`),
};

export default api;
