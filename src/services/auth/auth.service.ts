import { client } from '../../config/axios.config';
import { Cookie } from 'tough-cookie';

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
 * Authentication service for Animalagos portal
 */
export class AuthService {
  private static instance: AuthService;
  private isAuthenticated = false;
  private readonly baseUrl = 'https://animalagos.com/web';
  private readonly loginUrl: string;
  private readonly artistLoginUrl: string;
  private readonly serviceName = 'AuthService';

  private constructor() {
    this.loginUrl = `${this.baseUrl}/login?perfil=Artista`;
    this.artistLoginUrl = `${this.baseUrl}/artista/login`;
    console.log(`[${this.serviceName}] Initializing authentication service`);
  }

  /**
   * Get singleton instance of AuthService
   */
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login to Animalagos portal
   * @param credentials User credentials
   * @returns Whether login was successful
   */
  async login(credentials: { email: string; password: string }): Promise<boolean> {
    console.log(`[${this.serviceName}] Logging in to Animalagos portal...`);
    
    try {
      // Get the login page first
      await this.getLoginPage();
      
      // Submit the login form
      const loginSuccess = await this.submitLoginForm(credentials);
      
      if (loginSuccess) {
        console.log(`[${this.serviceName}] Successfully logged in to Animalagos portal!`);
        
        // Log debug information about the landing page after login
        await this.logLandingPageDetails();
      } else {
        console.error(`[${this.serviceName}] Failed to login to Animalagos portal!`);
      }
      
      return loginSuccess;
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
    console.log(`[${this.serviceName}] Attempting to get login page at ${this.loginUrl}`);
    const response = await client.get(this.loginUrl);
    console.log(`[${this.serviceName}] Login page loaded with status: ${response.status}`);

    // Now access the artist login page to capture any additional cookies
    console.log(`[${this.serviceName}] Accessing artist login page at ${this.artistLoginUrl}`);
    const artistLoginResponse = await client.get(this.artistLoginUrl);
    console.log(`[${this.serviceName}] Artist login page loaded with status: ${artistLoginResponse.status}`);
  }

  /**
   * Submit the login form with credentials
   */
  private async submitLoginForm(credentials: { email: string; password: string }): Promise<boolean> {
    console.log(`[${this.serviceName}] Submitting login form`);
    
    // Configure axios to automatically follow redirects
    const originalMaxRedirects = client.defaults.maxRedirects;
    client.defaults.maxRedirects = 5;
    
    try {
      // The actual login endpoint might be the artist login URL
      console.log(`[${this.serviceName}] Posting credentials to ${this.artistLoginUrl}`);
      
      // Create form data for login
      const formData: LoginFormData = {
        email: credentials.email,
        password: credentials.password,
        remember: 'on',
        terms: 'on'
      };
      
      // First, get the login page to extract any hidden fields
      console.log(`[${this.serviceName}] Getting login page to extract form fields`);
      const loginPageResponse = await client.get(this.artistLoginUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0'
        }
      });
      
      if (typeof loginPageResponse.data !== 'string') {
        throw new Error('Unexpected response type from login page');
      }
      
      // Extract ViewState and other hidden fields
      console.log(`[${this.serviceName}] Extracting form fields from login page`);
      const viewStateMatch = loginPageResponse.data.match(/id="__VIEWSTATE" value="([^"]*?)"/);
      const viewStateGeneratorMatch = loginPageResponse.data.match(/id="__VIEWSTATEGENERATOR" value="([^"]*?)"/);
      const eventValidationMatch = loginPageResponse.data.match(/id="__EVENTVALIDATION" value="([^"]*?)"/);
      
      // Add ASP.NET specific fields if found
      if (viewStateMatch && viewStateMatch[1]) {
        formData['__VIEWSTATE'] = viewStateMatch[1];
      }
      if (viewStateGeneratorMatch && viewStateGeneratorMatch[1]) {
        formData['__VIEWSTATEGENERATOR'] = viewStateGeneratorMatch[1];
      }
      if (eventValidationMatch && eventValidationMatch[1]) {
        formData['__EVENTVALIDATION'] = eventValidationMatch[1];
      }
      
      console.log(`[${this.serviceName}] Form data keys: ${Object.keys(formData).join(', ')}`);
      
      // Add headers including any cookies from the login page response
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': this.artistLoginUrl,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Origin': this.baseUrl,
        'Cookie': loginPageResponse.headers['set-cookie']?.join('; ') || ''
      };
      
      console.log(`[${this.serviceName}] Request headers: ${JSON.stringify(headers)}`);
      
      // Submit the login form
      console.log(`[${this.serviceName}] Submitting login form to ${this.artistLoginUrl}`);
      const response = await client.post(this.artistLoginUrl, formData, { headers });
      
      // Log response details
      console.log(`[${this.serviceName}] Response status: ${response.status}`);
      console.log(`[${this.serviceName}] Response headers: ${JSON.stringify(response.headers)}`);
      console.log(`[${this.serviceName}] Response cookies: ${JSON.stringify(response.headers['set-cookie'])}`);
      
      // Check if we've been redirected to a post-login page
      const isSuccessful = response.status === 200 || response.status === 301 || response.status === 302;
      const finalUrl = response.request?.res?.responseUrl || '';
      
      console.log(`[${this.serviceName}] Login request completed with status ${response.status}`);
      console.log(`[${this.serviceName}] Final URL after redirects: ${finalUrl}`);
      
      // If the finalUrl doesn't include 'login', we were successfully redirected to a logged-in area
      this.isAuthenticated = isSuccessful && !finalUrl.includes('/login');
      console.log(`[${this.serviceName}] Login ${this.isAuthenticated ? 'successful' : 'failed'}`);
      
      // If login failed but we received a successful response, it might have error messages
      if (!this.isAuthenticated && response.status === 200) {
        console.log(`[${this.serviceName}] Login might have failed due to incorrect credentials or form structure`);
        if (typeof response.data === 'string') {
          console.log(`[${this.serviceName}] Response body preview: ${response.data.substring(0, 500)}...`);
        }
      }
      
      return this.isAuthenticated;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Login error: ${errorMessage}`);
      if (error instanceof Error && error.stack) {
        console.error(`[${this.serviceName}] Stack trace: ${error.stack}`);
      }
      return false;
    } finally {
      // Restore the original maxRedirects setting
      client.defaults.maxRedirects = originalMaxRedirects;
    }
  }

  /**
   * Check if the current session is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Validate the current session
   */
  async validateSession(): Promise<boolean> {
    try {
      return await this.checkAuthenticatedState();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Session validation error: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Check if we are still in an authenticated state
   */
  private async checkAuthenticatedState(): Promise<boolean> {
    console.log(`[${this.serviceName}] Validating session...`);
    
    // Try to access the artist login page - if we're logged in, we should be redirected
    const response = await client.get(this.artistLoginUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    // If we're redirected away from login, we're authenticated
    // Status 302 indicates a redirect which would happen if we're already logged in
    const isValid = response.status === 302 || 
                   (response.status === 200 && !response.request?.res?.responseUrl?.includes('/login'));
    
    console.log(`[${this.serviceName}] Session validation ${isValid ? 'successful' : 'failed'}`);
    return isValid;
  }

  /**
   * Log details about the landing page after login
   */
  private async logLandingPageDetails(): Promise<void> {
    try {
      console.log(`[${this.serviceName}] Getting landing page details after login...`);
      
      // Just use the base URL and follow redirects naturally
      const response = await client.get(this.baseUrl, {
        maxRedirects: 5,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Referer': this.baseUrl,
        }
      });
      
      const finalUrl = response.request?.res?.responseUrl || this.baseUrl;
      console.log(`[${this.serviceName}] Landing page URL: ${finalUrl}`);
      console.log(`[${this.serviceName}] Landing page status: ${response.status}`);
      console.log(`[${this.serviceName}] Landing page headers: ${JSON.stringify(response.headers)}`);
      
      // Log information about the page content
      if (typeof response.data === 'string') {
        // Extract page title
        const titleMatch = response.data.match(/<title>(.*?)<\/title>/i);
        const pageTitle = titleMatch ? titleMatch[1] : 'Unknown';
        console.log(`[${this.serviceName}] Landing page title: ${pageTitle}`);
        
        // Log meta description if available
        const metaDescMatch = response.data.match(/<meta name="description" content="(.*?)"/i);
        if (metaDescMatch) {
          console.log(`[${this.serviceName}] Page description: ${metaDescMatch[1]}`);
        }
        
        // Check if we're logged in by looking for certain elements
        const hasLogoutLink = response.data.includes('logout') || response.data.includes('sign out');
        const hasUserProfile = response.data.includes('profile') || response.data.includes('account');
        console.log(`[${this.serviceName}] Page contains logout link: ${hasLogoutLink}`);
        console.log(`[${this.serviceName}] Page contains user profile references: ${hasUserProfile}`);
        
        // Save HTML for debug purposes
        this.saveHtmlForDebugging(response.data, 'landing-page.html');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Error getting landing page details: ${errorMessage}`);
    }
  }

  /**
   * Save HTML content to a file for debugging
   */
  private saveHtmlForDebugging(html: string, filename: string): void {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Create output directory if it doesn't exist
      const outputDir = path.join(process.cwd(), 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, html);
      console.log(`[${this.serviceName}] Saved HTML to ${filePath} for debugging`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Error saving HTML: ${errorMessage}`);
    }
  }
} 