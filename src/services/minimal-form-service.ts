import { client } from '../config/axios.config';
import * as fs from 'fs';
import * as path from 'path';
import { Cookie } from 'tough-cookie';
import { buildFormData } from '../utils/encoding';

/**
 * Interface for login form data
 */
interface LoginFormData {
  email: string;
  password: string;
  remember: string;
  terms: string;
  __VIEWSTATE?: string;
  __VIEWSTATEGENERATOR?: string;
  __EVENTVALIDATION?: string;
}

/**
 * Interface for the artist registration form data
 */
export interface ArtistRegistrationForm {
  nomecomercial: string; // Commercial name
  tabela: string; // Table name
  a: string; // Artist name
  b: string; // Artist email
  g: string; // Date
  c: string; // Street/location
  i: string; // Time slot
}

/**
 * Minimal service for Animalagos artist registration
 */
export class AnimalagosService {
  private static instance: AnimalagosService;
  private isAuthenticated = false;
  private readonly baseUrl = 'https://animalagos.com/web';
  private readonly loginUrl: string;
  private readonly artistLoginUrl: string;
  private readonly serviceName = 'AnimalagosService';

  private constructor() {
    this.loginUrl = `${this.baseUrl}/login?perfil=Artista`;
    this.artistLoginUrl = `${this.baseUrl}/artista/login`;
    console.log(`[${this.serviceName}] Initializing service`);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AnimalagosService {
    if (!AnimalagosService.instance) {
      AnimalagosService.instance = new AnimalagosService();
    }
    return AnimalagosService.instance;
  }

  /**
   * Login to the system
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log(`[${this.serviceName}] Login attempt for: ${email}`);
      
      // Clear any existing cookies
      const { jar } = client.defaults;
      if (jar) {
        jar.removeAllCookiesSync();
      }

      // Capture initial cookies from login page
      await this.getLoginPage();

      // Submit the login form with credentials
      const loginSuccess = await this.submitLoginForm(email, password);
      
      if (!loginSuccess) {
        console.log(`[${this.serviceName}] Login unsuccessful`);
        return false;
      }
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Login error: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get the login page to capture session cookies
   */
  private async getLoginPage(): Promise<void> {
    const response = await client.get(this.loginUrl);
    
    // Now access the artist login page to capture any additional cookies
    const artistLoginResponse = await client.get(this.artistLoginUrl);
  }

  /**
   * Submit the login form to authenticate
   */
  private async submitLoginForm(email: string, password: string): Promise<boolean> {
    // Configure axios to automatically follow redirects
    const originalMaxRedirects = client.defaults.maxRedirects;
    client.defaults.maxRedirects = 5;
    
    try {
      // Get the login page to extract any hidden fields
      const loginPageResponse = await client.get(this.artistLoginUrl);
      
      // Extract any ASP.NET specific hidden fields
      const viewStateMatch = loginPageResponse.data.match(/id="__VIEWSTATE" value="([^"]*?)"/);
      const viewStateGeneratorMatch = loginPageResponse.data.match(/id="__VIEWSTATEGENERATOR" value="([^"]*?)"/);
      const eventValidationMatch = loginPageResponse.data.match(/id="__EVENTVALIDATION" value="([^"]*?)"/);
      
      // Create form data for login
      const formData: LoginFormData = {
        email: email,
        password: password,
        remember: 'on',
        terms: 'on'
      };
      
      // Add ASP.NET specific fields if found
      if (viewStateMatch) {
        formData['__VIEWSTATE'] = viewStateMatch[1];
      }
      if (viewStateGeneratorMatch) {
        formData['__VIEWSTATEGENERATOR'] = viewStateGeneratorMatch[1];
      }
      if (eventValidationMatch) {
        formData['__EVENTVALIDATION'] = eventValidationMatch[1];
      }
      
      // Add headers including any cookies from the login page
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': this.artistLoginUrl,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Origin': this.baseUrl,
        'Cookie': ''
      };
      
      // Submit the login form
      const response = await client.post(this.artistLoginUrl, formData, { headers });
      
      // Check if we've been redirected to a post-login page
      const finalUrl = response.request?.res?.responseUrl || '';
      
      // If the finalUrl doesn't include 'login', we were successfully redirected to a logged-in area
      this.isAuthenticated = response.status === 200 && !finalUrl.includes('/login');
      
      return this.isAuthenticated;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Login error: ${errorMessage}`);
      return false;
    } finally {
      // Restore original redirect setting
      client.defaults.maxRedirects = originalMaxRedirects;
    }
  }

  /**
   * Submits form data to register an artist for a time slot
   */
  async submitArtistRegistration(options: Partial<ArtistRegistrationForm> = {}): Promise<any> {
    // Default form data
    const defaultData: ArtistRegistrationForm = {
      nomecomercial: "anilagos",
      tabela: "inscricoes",
      a: "Nenad Konstantin",
      b: "gitaroholicar@gmail.com",
      g: "31-03-2025",
      c: "Praça Gil Eanes",
      i: "", // Time slot should be selected from available options
    };

    // Merge default data with any provided options
    const formData = { ...defaultData, ...options };
    
    try {
      // Log the original location text for debugging
      console.log(`[${this.serviceName}] Original location text: "${formData.c}"`);
      
      // Build form data with Latin-1 encoding for location field
      const formBody = buildFormData(formData, ['c']);
      
      console.log(`[${this.serviceName}] Submitting form with mixed encoding:`, formBody);
      
      // Send with explicit headers specifying Latin-1 charset
      const response = await client.post(`${this.baseUrl}/artista/inscricao-artista`, formBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=ISO-8859-1',
          'Referer': `${this.baseUrl}/artista/timeline`,
          'Origin': 'https://animalagos.com',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        transformRequest: [(data) => data] // Prevent axios from transforming data
      });

      return response;
    } catch (error) {
      console.error(`[${this.serviceName}] Error submitting form:`, error);
      throw error;
    }
  }
} 