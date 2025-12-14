import axios from "axios";
import Cookies from "js-cookie";

const apiUrl = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: `${apiUrl}`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const temporararyUserId = Cookies.get("temporary_user");
  if (temporararyUserId) {
    config.headers["X-Temporary-User"] = temporararyUserId;
  }
  return config;
});

export default api;
