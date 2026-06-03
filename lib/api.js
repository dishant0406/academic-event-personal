const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? "https://academic-event-7bk1.vercel.app/api" 
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

export async function fetchApi(endpoint, options = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Remove Content-Type if body is FormData (browser will set it automatically with boundary)
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
