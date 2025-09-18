const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function apiGet(endpoint, options = {}) {
  // Combine default headers with any custom ones
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Use the browser's default cache unless specified otherwise
  const cache = options.cache || 'default';

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache,
  });

  if (!res.ok) {
    // Try to get a more specific error message from the API response
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Failed to fetch ${endpoint}`);
  }

  return res.json();
}

// Generic POST request
export async function apiPost(endpoint, data) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to post to ${endpoint}`);
  return res.json();
}
