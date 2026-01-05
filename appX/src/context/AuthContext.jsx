import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token) {
      try {
        const res = await API.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("Auth check error:", error);
        clearAuth();
      }
    }
    setLoading(false);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      const res = await API.post("/user/auth/login", { email, password });
      
      if (res.data.success) {
        const { token, user } = res.data;
        
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return { success: true };
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await API.post("/user/auth/register", {
        name,
        email,
        password
      });

      if (res.data.success) {
        const { token, user } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);

        return { success: true };
      } else {
        throw new Error(res.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  const logout = () => {
    clearAuth();
  };

  const updateProfile = async (profileData) => {
    const token = localStorage.getItem("token");

    try {
      const res = await API.put(
        "/user/profile",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error) {
      console.error("Update profile error:", error);
      throw error.response?.data || error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    const token = localStorage.getItem("token");

    try {
      const res = await API.put(
        "/user/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const getAddresses = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await API.get("/user/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const addAddress = async (addressData) => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await API.post("/user/addresses", addressData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.data.success && user) {
        const updatedUser = { ...user, addresses: res.data.addresses };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const updateAddress = async (addressId, addressData) => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await API.put(`/user/addresses/${addressId}`, addressData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.data.success && user) {
        const updatedUser = { ...user, addresses: res.data.addresses };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const deleteAddress = async (addressId) => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await API.delete(`/user/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.data.success && user) {
        const updatedUser = { ...user, addresses: res.data.addresses };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        updateProfile,
        changePassword,
        getAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        refreshUser: checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

