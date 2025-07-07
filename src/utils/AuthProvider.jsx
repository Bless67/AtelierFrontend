import { useState, useContext, createContext, useEffect } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    try {
      const response = await api.get("user/");
      setUser(response.data);

      return response.data;
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post("login/", {
        username: username,
        password: password,
      });

      const theUser = await getUser();
      setUser(theUser);
      navigate("/");
    } catch (err) {}
  };

  const logout = async () => {
    try {
      const response = await api.post("logout/");

      setUser(null);
      navigate("/");
    } catch (err) {}
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
