import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  picture?: string;
  profilePhoto?: string;
  profileImage?: string;
  authProvider?: string;
  isCoordinator?: boolean;
  createdAt?: string;
  department?: string;
  phoneNumber?: string;
  bio?: string;
  preferences?: {
    theme?: "light" | "dark";
    accentColor?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData?: User) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("eventra_token");
      if (savedToken) {
        try {
          const response = await api.get("/users/profile", savedToken);
          if (response.success) {
            setToken(savedToken);
            setUser(response.data);
            localStorage.setItem("eventra_user", JSON.stringify(response.data));
            
            // Apply preferences if available
            if (response.data.preferences) {
               applyPreferences(response.data.preferences);
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error("Auth sync failed:", error);
          const savedUser = localStorage.getItem("eventra_user");
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setToken(savedToken);
            setUser(parsedUser);
            if (parsedUser.preferences) {
              applyPreferences(parsedUser.preferences);
            }
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const applyPreferences = (preferences: { theme?: string; accentColor?: string }) => {
    // Theme application
    if (preferences.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (preferences.theme === "light") {
      document.documentElement.classList.remove("dark");
    }

    // Accent Color application
    if (preferences.accentColor) {
      // Remove any existing accent classes
      const classes = document.documentElement.classList;
      const accentClasses = Array.from(classes).filter(c => c.startsWith("accent-"));
      accentClasses.forEach(c => classes.remove(c));
      
      // Add the new accent class
      classes.add(`accent-${preferences.accentColor}`);
    }
  };

  const login = async (newToken: string, userData?: User) => {
    setToken(newToken);
    localStorage.setItem("eventra_token", newToken);
    
    if (userData) {
      setUser(userData);
      localStorage.setItem("eventra_user", JSON.stringify(userData));
      if (userData.preferences) {
        applyPreferences(userData.preferences);
      }
      return userData;
    }

    try {
      const response = await api.get("/users/profile", newToken);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem("eventra_user", JSON.stringify(response.data));
        if (response.data.preferences) {
          applyPreferences(response.data.preferences);
        }
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch user profile");
    } catch (error) {
      console.error("Failed to fetch user profile after login:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("eventra_token");
    localStorage.removeItem("eventra_user");
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      
      // If updating preferences, merge them with existing ones
      let updatedPreferences = userData.preferences;
      if (prev.preferences && userData.preferences) {
        updatedPreferences = { ...prev.preferences, ...userData.preferences };
      }

      const updated = { 
        ...prev, 
        ...userData,
        preferences: updatedPreferences || userData.preferences || prev.preferences
      };
      
      localStorage.setItem("eventra_user", JSON.stringify(updated));
      
      if (updated.preferences) {
        applyPreferences(updated.preferences);
      }
      
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
