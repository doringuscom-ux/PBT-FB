import axios from 'axios';

const isLocal = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isLocal
    ? (process.env.NEXT_PUBLIC_API_URL_LOCAL || 'https://pbt-iyjf.onrender.com/api').replace('/api', '')
    : (process.env.NEXT_PUBLIC_API_URL || 'https://pbt-iyjf.onrender.com/api').replace('/api', '');

console.log('API BASE URL INITIALIZED AS:', `${API_BASE_URL}/api`); const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
    timeout: 60000 // 60 seconds timeout to allow Render free tier to wake up
});

export const widgetApi = axios.create({
    baseURL: isLocal
        ? (process.env.NEXT_PUBLIC_WIDGET_API_URL_LOCAL || 'https://weather-market.vercel.app/api')
        : (process.env.NEXT_PUBLIC_WIDGET_API_URL_PROD || 'https://weather-market.vercel.app/api')
});

export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (credentials) => api.post('/auth/register', credentials);
export const verifyRegistration = (data) => api.post('/auth/verify-registration', data);

export const getMovies = () => api.get('/movies');
export const addMovie = (data) => api.post('/movies', data);
export const updateMovie = (id, data) => api.put(`/movies/${id}`, data);
export const deleteMovie = (id) => api.delete(`/movies/${id}`);
export const addMovieComment = (id, data) => api.post(`/movies/${id}/comments`, data);
export const deleteMovieComment = (id, commentId) => api.delete(`/movies/${id}/comments/${commentId}`);
export const likeMovieComment = (id, commentId) => api.post(`/movies/${id}/comments/${commentId}/like`);
export const updateMovieComment = (id, commentId, data) => api.put(`/movies/${id}/comments/${commentId}`, data);
export const rateMovie = (id, rating, review) => api.post(`/movies/${id}/rate`, { rating, review });
export const deleteMovieRating = (id) => api.delete(`/movies/${id}/rate`);

export const getNews = () => api.get('/news');
export const getTodayNews = () => api.get('/news/today');
export const addNews = (data) => api.post('/news', data);
export const updateNews = (id, data) => api.put(`/news/${id}`, data);
export const deleteNews = (id) => api.delete(`/news/${id}`);
export const addComment = (newsId, data) => api.post(`/news/${newsId}/comments`, data);
export const deleteComment = (newsId, commentId) => api.delete(`/news/${newsId}/comments/${commentId}`);
export const likeComment = (newsId, commentId) => api.post(`/news/${newsId}/comments/${commentId}/like`);
export const reportComment = (newsId, commentId) => api.post(`/news/${newsId}/comments/${commentId}/report`);
export const updateComment = (newsId, commentId, data) => api.put(`/news/${newsId}/comments/${commentId}`, data);

export const getCelebrities = () => api.get('/celebrities');
export const addCelebrity = (data) => api.post('/celebrities', data);
export const updateCelebrity = (id, data) => api.put(`/celebrities/${id}`, data);
export const deleteCelebrity = (id) => api.delete(`/celebrities/${id}`);
export const addCelebComment = (id, data) => api.post(`/celebrities/${id}/comments`, data);
export const deleteCelebComment = (id, commentId) => api.delete(`/celebrities/${id}/comments/${commentId}`);
export const likeCelebComment = (id, commentId) => api.post(`/celebrities/${id}/comments/${commentId}/like`);
export const updateCelebComment = (id, commentId, data) => api.put(`/celebrities/${id}/comments/${commentId}`, data);
export const followCelebrity = (id) => api.post(`/celebrities/${id}/follow`);

// Video API
export const getVideos = () => api.get('/videos');
export const addVideo = (data) => api.post('/videos', data);
export const updateVideo = (id, data) => api.put(`/videos/${id}`, data);
export const deleteVideo = (id) => api.delete(`/videos/${id}`);
export const addVideoComment = (id, data) => api.post(`/videos/${id}/comments`, data);
export const deleteVideoComment = (id, commentId) => api.delete(`/videos/${id}/comments/${commentId}`);
export const likeVideoComment = (id, commentId) => api.post(`/videos/${id}/comments/${commentId}/like`);
export const updateVideoComment = (id, commentId, data) => api.put(`/videos/${id}/comments/${commentId}`, data);

export const getUsers = () => api.get('/users');
export const createUser = (userData) => api.post('/users', userData);
export const blockUser = (id) => api.put(`/users/${id}/block`);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const updateUserPassword = (id, newPassword) => api.put(`/users/${id}/password`, { newPassword });
export const deleteVideoOld = (id) => api.delete(`/users/${id}`); // Corrected in next call if needed, this was users
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const subscribeNewsletter = (email) => api.post('/subscribers/subscribe', { email });
export const getSubscribersList = () => api.get('/subscribers');
export const getSubStats = () => api.get('/subscribers/stats');
export const getEmailLogs = () => api.get('/subscribers/logs');
export const deleteSubscriber = (id) => api.delete(`/subscribers/${id}`);

export const getInquiries = () => api.get('/inquiries');
export const submitInquiry = (data) => api.post('/inquiries', data);
export const deleteInquiry = (id) => api.delete(`/inquiries/${id}`);
export const updateInquiry = (id, data) => api.put(`/inquiries/${id}`, data);

export const getAnnouncements = () => api.get('/announcements');
export const addAnnouncement = (data) => api.post('/announcements', data);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

export const getPromotions = () => api.get('/promotions');
export const addPromotion = (data) => api.post('/promotions', data);
export const updatePromotion = (id, data) => api.put(`/promotions/${id}`, data);
export const deletePromotion = (id) => api.delete(`/promotions/${id}`);

export const getWidgets = (params) => widgetApi.get('/widgets', { params });

export const autoGenerateCelebSEO = () => api.post('/seo/auto-generate-celebs');

export const getSettings = () => api.get('/settings');
export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value });

export default api;
