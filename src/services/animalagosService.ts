import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { client } from '../config/axios.config';

// Define types locally since the module cannot be found
interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
}

interface TimelineResponse {
  artists: Artist[];
  date: string;
  place: string;
}

/**
 * Service for interacting with the Animalagos API
 */
export class AnimalagosService {
  private baseUrl: string = 'https://animalagos.com/web/artista/timeline';
  private readonly debugDir: string;

  constructor() {
    this.debugDir = path.join(process.cwd(), 'debug');
    
    // Create debug directory if it doesn't exist
    if (!fs.existsSync(this.debugDir)) {
      fs.mkdirSync(this.debugDir, { recursive: true });
    }
  }

  /**
   * Fetches timeline data based on date and place
   * @param date - Date in DD-MM-YYYY format
   * @param place - Name of the place/location
   * @returns Promise with the response data
   */
  async getTimelineData(date: string, place: string): Promise<TimelineResponse> {
    try {
      // Use the shared client instance with session cookies
      const response = await client.get(this.baseUrl, {
        params: {
          g: date,
          c: place
        },
        headers: {
          'Referer': 'https://animalagos.com/web/artista/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      // Log cookies for debugging
      const { jar } = client.defaults;
      if (jar) {
        const cookies = jar.getCookiesSync('https://animalagos.com');
        console.log(`[AnimalagosService] Using cookies: ${cookies.map(c => `${c.key}=${c.value.substring(0, 5)}...`).join('; ')}`);
      }
      
      // The response is HTML, so we need to parse it to extract the data
      const htmlContent = response.data;
      
      // Check if the response was redirected
      if (response.request?.res?.responseUrl) {
        console.log(`[AnimalagosService] Request was redirected to: ${response.request.res.responseUrl}`);
      }
      
      // Parse the HTML to extract artists and locations
      const parsedData = this.parseHtmlContent(htmlContent, date, place);
      
      return parsedData;
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      throw error;
    }
  }

  /**
   * Fetches timeline data with detailed debugging information
   * @param date - Date in DD-MM-YYYY format
   * @param place - Name of the place/location
   * @returns Promise with detailed request and response information
   */
  async getTimelineDataWithDebug(date: string, place: string): Promise<any> {
    console.log('[AnimalagosService] Fetching timeline data with debug information');
    console.log(`[AnimalagosService] Request parameters: date=${date}, place=${place}`);
    
    // Save URL with query parameters for logging
    const queryParams = new URLSearchParams({
      g: date,
      c: place
    });
    const fullUrl = `${this.baseUrl}?${queryParams.toString()}`;
    console.log(`[AnimalagosService] Full URL: ${fullUrl}`);
    
    // Log all available cookies
    const { jar } = client.defaults;
    if (jar) {
      const cookies = jar.getCookiesSync('https://animalagos.com');
      console.log(`[AnimalagosService] Sending request with cookies: ${cookies.map(c => `${c.key}=${c.value.substring(0, 5)}...`).join('; ')}`);
      
      // Specifically look for session cookies
      const sessionCookies = cookies.filter(cookie => {
        return cookie.key === 'ASP.NET_SessionId' || 
               cookie.key.toLowerCase().includes('auth') ||
               cookie.key.toLowerCase().includes('session');
      });
      
      if (sessionCookies.length > 0) {
        console.log(`[AnimalagosService] Session cookies found: ${sessionCookies.map(c => c.key).join(', ')}`);
      } else {
        console.log('[AnimalagosService] Warning: No session cookies found');
      }
    }
    
    try {
      // Temporarily disable automatic redirects
      const originalMaxRedirects = client.defaults.maxRedirects;
      client.defaults.maxRedirects = 5; // Set to 5 to allow following redirects
      
      console.log('[AnimalagosService] Sending request with headers:');
      console.log(JSON.stringify({
        ...client.defaults.headers,
        'Referer': 'https://animalagos.com/web/artista/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9'
      }, null, 2));
      
      // Make the request
      const startTime = Date.now();
      const response = await client.get(fullUrl, {
        headers: {
          'Referer': 'https://animalagos.com/web/artista/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const endTime = Date.now();
      
      // Log response time
      console.log(`[AnimalagosService] Response received in ${endTime - startTime}ms`);
      
      // Log response details
      console.log(`[AnimalagosService] Response status: ${response.status} ${response.statusText}`);
      console.log('[AnimalagosService] Response headers:');
      console.log(JSON.stringify(response.headers, null, 2));
      
      // Get final URL if redirected
      if (response.request?.res?.responseUrl) {
        console.log(`[AnimalagosService] Final URL after redirects: ${response.request.res.responseUrl}`);
      }
      
      // Save the complete response to a file
      const responseFilename = `timeline_debug_${date.replace(/\//g, '-')}_${place.replace(/\s+/g, '_')}.json`;
      this.saveDebugResponse(responseFilename, {
        requestUrl: fullUrl,
        requestTime: new Date().toISOString(),
        responseTime: `${endTime - startTime}ms`,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        finalUrl: response.request?.res?.responseUrl || fullUrl,
        // Only save the first 1000 characters of the HTML for brevity
        data: typeof response.data === 'string' 
          ? `${response.data.substring(0, 1000)}... [truncated, full HTML in separate file]` 
          : response.data
      });
      
      // Save the full HTML response separately
      if (typeof response.data === 'string') {
        const htmlFilename = `timeline_debug_${date.replace(/\//g, '-')}_${place.replace(/\s+/g, '_')}.html`;
        this.saveHtmlResponse(response.data, htmlFilename);
      }
      
      // Parse the HTML to extract data
      const parsedData = this.parseHtmlContent(response.data, date, place);
      
      // Restore original redirect setting
      client.defaults.maxRedirects = originalMaxRedirects;
      
      // Return a complete debug object
      return {
        request: {
          url: fullUrl,
          params: { date, place },
          headers: client.defaults.headers,
          time: new Date().toISOString()
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          finalUrl: response.request?.res?.responseUrl || fullUrl,
          responseTime: `${endTime - startTime}ms`
        },
        parsedData,
        debugFileSaved: responseFilename
      };
    } catch (error: any) {
      console.error('[AnimalagosService] Error fetching timeline data with debug:', error.message);
      
      // Save error details
      const errorResponse = {
        requestUrl: fullUrl,
        requestTime: new Date().toISOString(),
        error: {
          message: error.message,
          stack: error.stack,
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers
        }
      };
      
      const errorFilename = `timeline_debug_error_${date.replace(/\//g, '-')}_${place.replace(/\s+/g, '_')}.json`;
      this.saveDebugResponse(errorFilename, errorResponse);
      
      throw error;
    }
  }

  // ... rest of the class ...
}