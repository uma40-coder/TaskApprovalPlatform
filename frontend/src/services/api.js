import axiosInstance from '../api/axiosInstance';

export const authService = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  getMe: () => axiosInstance.get('/auth/me'),
  checkStatus: () => axiosInstance.get('/auth/status'),
};

export const userService = {
  getAll: (params) => axiosInstance.get('/users', { params }),
  getById: (id) => axiosInstance.get(`/users/${id}`),
  approve: (id) => axiosInstance.put(`/users/${id}/approve`),
  reject: (id, reason) => axiosInstance.put(`/users/${id}/reject`, { reason }),
  getStats: () => axiosInstance.get('/users/stats'),
  getProfile: () => axiosInstance.get('/users/profile/me'),
  getNotifications: () => axiosInstance.get('/users/notifications/all'),
  markNotificationRead: (id) => axiosInstance.put(`/users/notifications/${id}/read`),
};

export const taskService = {
  create: (data) => axiosInstance.post('/tasks', data),
  getAll: (params) => axiosInstance.get('/tasks', { params }),
  getById: (id) => axiosInstance.get(`/tasks/${id}`),
  update: (id, data) => axiosInstance.put(`/tasks/${id}`, data),
  delete: (id) => axiosInstance.delete(`/tasks/${id}`),
  getStats: () => axiosInstance.get('/tasks/stats'),
};

export const messageService = {
  send: (data) => axiosInstance.post('/messages', data),
  getMessages: (conversationId) => axiosInstance.get(`/messages/${conversationId}`),
  getConversations: () => axiosInstance.get('/messages/conversations'),
  getUnreadCount: () => axiosInstance.get('/messages/unread-count'),
};
