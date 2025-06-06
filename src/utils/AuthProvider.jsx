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
      console.log(response.data);
      return response.data;
    } catch (err) {
      setUser(null);

      console.error(err);
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
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      const response = await api.post("logout/");
      console.log(response.data);
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
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
