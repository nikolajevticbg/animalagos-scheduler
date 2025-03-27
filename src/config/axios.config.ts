import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

export const client = wrapper(axios.create({
  jar,
  withCredentials: true,
  baseURL: process.env.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
}));

// Global error interceptor
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      return handleAuthError(error);
    }
    return Promise.reject(error);
  }
); 