import axios, { AxiosResponse, AxiosError } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import dotenv from 'dotenv';

dotenv.config();

const jar = new CookieJar();

const handleAuthError = async (error: AxiosError): Promise<AxiosResponse> => {
  // Implement your authentication error handling logic here
  // For example, refresh token, redirect to login, etc.
  throw error;
};

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
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      return handleAuthError(error);
    }
    return Promise.reject(error);
  }
); 