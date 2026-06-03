const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  let data;
  try {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (response.status >= 500) {
        return { success: false, error: "The server took too long to respond or encountered an error." };
      }
      return { success: false, error: "Invalid response format from server." };
    }
  } catch (error) {
    return { success: false, error: "Network error occurred." };
  }
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');

    // Prevent infinite refresh loop
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  return data;
}