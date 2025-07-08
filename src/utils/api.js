import axios from "axios";

const api = axios.create({
  baseURL: "https://yabuwatatelier.up.railway.app/api",
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const temporaryUserId = Cookies.get("temporay_user");
  if (temporaryUserId) {
    config.headers["X-Temporary-User"] = temporaryUserId;
  }
  return config;
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
