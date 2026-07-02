const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // If we are on a real domain (like vercel) use the production backend
    if (host.includes("vercel.app") || host.includes("eventra")) {
      return "https://eventra-backend-1-upth.onrender.com/api";
    }
    // If we are accessing via IP (mobile testing on local network) 
    // we should still likely use the production backend unless the user has local backend exposed
    // But most users want the 'easy' way which is production for mobile
    if (host !== "localhost" && host !== "127.0.0.1") {
       return "https://eventra-backend-1-upth.onrender.com/api";
    }
  }
  return import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
};

const API_URL = getBaseUrl();

export const api = {
  get: async (endpoint: string, token?: string) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();
      if (!response.ok && !data.success) {
        return { success: false, message: data.message || data.detail || "Request failed", ...data };
      }
      return data;
    } catch (error) {
      console.error("API GET Error:", error);
      throw error;
    }
  },
  post: async (endpoint: string, data: any, token?: string) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok && !responseData.success) {
        return { 
          success: false, 
          message: responseData.message || responseData.detail || `Server error (${response.status})`, 
          ...responseData 
        };
      }
      return responseData;
    } catch (error) {
      console.error("API POST Error:", error);
      throw error;
    }
  },
  put: async (endpoint: string, data: any, token?: string) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok && !responseData.success) {
        return { success: false, message: responseData.message || responseData.detail || "Update failed", ...responseData };
      }
      return responseData;
    } catch (error) {
      console.error("API PUT Error:", error);
      throw error;
    }
  },
  delete: async (endpoint: string, token?: string) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();
      if (!response.ok && !data.success) {
        return { success: false, message: data.message || data.detail || "Delete failed", ...data };
      }
      return data;
    } catch (error) {
      console.error("API DELETE Error:", error);
      throw error;
    }
  },
};
