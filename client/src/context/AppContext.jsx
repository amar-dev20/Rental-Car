import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// API base URL
const API_BASE_URL = (
  import.meta.env.VITE_BASE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach the latest authentication token to requests
api.interceptors.request.use(
  (config) => {
    const currentToken = localStorage.getItem("token");

    config.headers = config.headers || {};

    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Create context
export const AppContext = createContext(null);

// App provider
export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const [token, setTokenState] = useState(
    () => localStorage.getItem("token")
  );

  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [cars, setCars] = useState([]);

  // Save or remove authentication token
  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem("token");

      setTokenState(null);
      setUser(null);
      setIsOwner(false);
    }
  }, []);

  // Fetch authenticated user
  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setUser(null);
      setIsOwner(false);
      return null;
    }

    try {
      const { data } = await api.get("/api/user/data");

      if (data.success && data.user) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");

        return data.user;
      }

      setUser(null);
      setIsOwner(false);

      console.error("Unexpected user API response:", data);

      return null;
    } catch (error) {
      console.error("Fetch user error:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        setToken(null);
      }

      return null;
    }
  }, [setToken]);

  // Fetch available cars
  const fetchCars = useCallback(async () => {
    try {
      const { data } = await api.get("/api/user/cars");

      if (data.success && Array.isArray(data.cars)) {
        setCars(data.cars);
      } else {
        setCars([]);

        console.error("Unexpected cars API response:", data);
      }
    } catch (error) {
      console.error("Fetch cars error:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setToken(null);
    setShowLogin(false);

    toast.success("You have been logged out");

    navigate("/");
  }, [navigate, setToken]);

  // Fetch cars on app startup
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Fetch authenticated user when token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setIsOwner(false);
    }
  }, [token, fetchUser]);

  // Context values
  const value = useMemo(
    () => ({
      navigate,
      currency,

      // Axios instance with authentication interceptor
      axios: api,

      // User
      user,
      setUser,

      // Authentication
      token,
      setToken,

      // Owner status
      isOwner,
      setIsOwner,

      // Login modal
      showLogin,
      setShowLogin,

      // API methods
      fetchUser,
      fetchCars,

      // Cars
      cars,
      setCars,

      // Logout
      logout,

      // Booking dates
      pickupDate,
      setPickupDate,

      returnDate,
      setReturnDate,
    }),
    [
      navigate,
      currency,
      user,
      token,
      setToken,
      isOwner,
      showLogin,
      fetchUser,
      fetchCars,
      cars,
      logout,
      pickupDate,
      returnDate,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppContext must be used within an AppProvider"
    );
  }

  return context;
};

export default AppContext;