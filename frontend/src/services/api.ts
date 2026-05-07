const BASE_URL = "https://reality-drift-backend-194526391508.asia-south1.run.app/api";

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

  const data = await response.json();

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');

    // Prevent infinite refresh loop
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  return data;
}