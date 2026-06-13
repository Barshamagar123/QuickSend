
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000';

export const apiClient = {
  async post(endpoint: string, data?: any) {
    const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
      method: 'POST',
      headers: data instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      body: data instanceof FormData ? data : JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },

  async get(endpoint: string) {
    const response = await fetch(`${GATEWAY_URL}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
};
