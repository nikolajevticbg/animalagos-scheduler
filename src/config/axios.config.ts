import axios, { AxiosResponse } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import dotenv from 'dotenv';

dotenv.config();

// Create cookie jar for session management
const jar = new CookieJar();

// Add custom redirection handler
const redirectHandler = (statusCode: number) => {
  const validateStatus = (status: number) => {
    return (status >= 200 && status < 300) || status === statusCode;
  };
  return validateStatus;
};

// Create the redirection configuration
export const redirectConfig = {
  validateStatus: redirectHandler(302),
};

// Create base axios instance without wrapper
const baseInstance = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 30000,
  maxRedirects: 5, // Default to allow redirects
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Charset': 'UTF-8' // Explicitly accept UTF-8 responses
  }
});

// Create wrapped client with cookie support
export const client = wrapper(baseInstance);
client.defaults.jar = jar;
client.defaults.withCredentials = true;

// Add a request interceptor
client.interceptors.request.use(
  function (config) {
    // Ensure headers object exists
    config.headers = config.headers || {};

    // Set Content-Type with UTF-8 charset if not already set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    } else if (
      config.headers['Content-Type'] && 
      typeof config.headers['Content-Type'] === 'string' &&
      config.headers['Content-Type'].includes('application/x-www-form-urlencoded') && 
      !config.headers['Content-Type'].includes('charset=UTF-8')
    ) {
      // Add charset if Content-Type is already set to application/x-www-form-urlencoded
      config.headers['Content-Type'] = `${config.headers['Content-Type']}; charset=UTF-8`;
    }

    // Only transform data if it's not already a string
    // This allows us to manually encode the data when needed
    if (
      config.method && 
      config.method.toLowerCase() === 'post' && 
      config.data && 
      typeof config.data === 'object' &&
      !(config.data instanceof URLSearchParams) && 
      !(typeof config.data === 'string')
    ) {
      const params = new URLSearchParams();
      
      // Add each property to the URLSearchParams object
      for (const key in config.data) {
        if (Object.prototype.hasOwnProperty.call(config.data, key)) {
          params.append(key, config.data[key]);
        }
      }
      
      config.data = params;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Enhancement to track the final URL after redirects
client.interceptors.response.use(
  (response: AxiosResponse) => {
    // Store final URL in response.request.res.responseUrl for convenience
    if (response.request && response.request.res) {
      response.request.res.responseUrl = response.request.res.responseUrl;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client; 