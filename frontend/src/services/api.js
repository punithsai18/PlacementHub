import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      const role = localStorage.getItem('role');
      window.location.href = role === 'company' ? '/company/login' : '/';
    }
    return Promise.reject(error);
  }
);

// Student API
export const studentApi = {
  register: (data) => api.post('/students/register', data),
  login: (data) => api.post('/students/login', data),
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  uploadResume: (formData) => api.post('/students/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getJobs: (params) => api.get('/students/jobs', { params }),
  applyJob: (jobId) => api.post(`/students/apply/${jobId}`),
  getApplications: () => api.get('/students/applications')
};

// Company API
export const companyApi = {
  login: (data) => api.post('/companies/login', data),
  register: (data) => api.post('/companies/register', data),
  postJob: (data) => api.post('/companies/jobs', data),
  getJobs: () => api.get('/companies/jobs'),
  getApplicants: (jobId) => api.get(`/companies/jobs/${jobId}/applicants`),
  updateApplication: (appId, data) => api.put(`/companies/applications/${appId}`, data),
  searchCandidates: (params) => api.get('/companies/search', { params })
};

// Chat API
export const chatApi = {
  getHistory: (userId) => api.get(`/chat/history/${userId}`),
  getToken: () => api.post('/chat/token'),
  sendMessage: (data) => api.post('/chat/message', data)
};

// Placements API
export const placementApi = {
  getAll: () => api.get('/placements'),
  getStats: () => api.get('/placements/stats'),
  getMy: () => api.get('/placements/my')
};

export default api;
