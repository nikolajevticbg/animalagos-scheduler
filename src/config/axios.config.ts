import axios, { AxiosResponse, AxiosError } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import dotenv from 'dotenv';

dotenv.config();

const jar = new CookieJar();

const handleAuthError = async (error: AxiosError): Promise<AxiosResponse> => {
  // Implement your authentication error handling logic here
  console.error('[AxiosClient] Authentication error occurred:', error.message);
  console.error('[AxiosClient] Status:', error.response?.status);
  console.error('[AxiosClient] URL:', error.config?.url);
  throw error;
};

export const client = wrapper(axios.create({
  jar,
  withCredentials: true,
  baseURL: process.env.API_BASE_URL,
  timeout: 30000,
  maxRedirects: 5, // Default to allow redirects
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
  }
}));

// Transform request data for form submissions
client.interceptors.request.use(
  (config) => {
    // For POST requests, transform JSON to form-urlencoded format
    if (config.method === 'post' && config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      // Convert data object to URLSearchParams
      if (config.data && typeof config.data === 'object') {
        const params = new URLSearchParams();
        for (const key in config.data) {
          params.append(key, config.data[key]);
        }
        config.data = params.toString();
        console.log(`[AxiosClient] Transformed request data to form-urlencoded: ${config.data}`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhancement to track the final URL after redirects
client.interceptors.response.use(
  (response: AxiosResponse) => {
    // Store final URL in response.request.res.responseUrl for convenience
    // This helps us determine if we were redirected
    if (response.request && response.request.res && response.request.res.responseUrl) {
      console.log(`[AxiosClient] Request redirected to: ${response.request.res.responseUrl}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Special handling for 301/302 redirects which might be caught as errors when maxRedirects is 0
    if (error.response?.status === 301 || error.response?.status === 302) {
      console.log(`[AxiosClient] Redirect detected: ${error.response.headers.location}`);
      return error.response;
    }
    
    if (error.response?.status === 401) {
      return handleAuthError(error);
    }
    return Promise.reject(error);
  }
); 