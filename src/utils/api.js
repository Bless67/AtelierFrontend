import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});
export default api;
/*
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post(
          "refresh/",
          {},
          {
            withCredentials: true,
          }
        );
        return api(originalRequest);
      } catch (refreshError) {
        console.error(refreshError);
      }
    }
    return Promise.reject(error);
  }
);*/
