export const fetchAdminAPI = async (endpoint: string, options: RequestInit = {}) => {
  const jwtToken = localStorage.getItem('jwtToken'); // Ensure this key is used
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (jwtToken) {
    defaultHeaders['Authorization'] = `Bearer ${jwtToken}`;
  }

  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Request failed with status " + response.status }));
      // Specific handling for 401/403 from admin API if needed, e.g., redirect to login or show specific message
      if (response.status === 401 || response.status === 403) {
        // Potentially trigger a global state update or event for unauthorized admin access
        console.error("Admin API request unauthorized:", errorData.details || errorData.error || errorData.message);
        // Unlike the main fetchAPI, admin calls failing due to auth shouldn't necessarily redirect all users to /login.
        // The ProtectedRoute should handle page access. This error indicates an issue with an already "logged-in" admin.
      }
      throw new Error(errorData.details || errorData.error || errorData.message || "API request failed");
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Admin API request failed:", error);
    throw error;
  }
};
