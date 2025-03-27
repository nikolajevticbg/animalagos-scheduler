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
   * Login to the system
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log(`[${this.serviceName}] Login attempt for: ${email}`);
      
      // Clear any existing cookies
      const { jar } = client.defaults;
      if (jar) {
        jar.removeAllCookiesSync();
        console.log(`[${this.serviceName}] Cleared existing cookies`);
      }

      // Submit the login form with credentials
      const loginSuccess = await this.submitLoginForm(email, password);
      
      if (!loginSuccess) {
        console.log(`[${this.serviceName}] Login unsuccessful`);
        return false;
      }
      
      console.log(`[${this.serviceName}] Login successful, checking session cookie`);
      
      // Get session cookie after login
      const sessionCookie = this.getSessionCookie();
      console.log(`[${this.serviceName}] Session cookie after login: ${sessionCookie || 'None'}`);
      
      if (!sessionCookie) {
        console.error(`[${this.serviceName}] No session cookie found after successful login`);
        return false;
      }
      
      // Navigate to the landing page
      await this.navigateToLandingPage();
      
      // Navigate to the artist timeline page
      await this.navigateToArtistTimeline();
      
      // Log cookies again after navigation
      console.log(`[${this.serviceName}] Session cookies after navigation:`);
      this.logCookies();
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Login error: ${errorMessage}`);
      
      if (error instanceof Error && error.stack) {
        console.error(`[${this.serviceName}] Stack trace: ${error.stack}`);
      }
      
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
   * Submit the login form to authenticate
   */
  private async submitLoginForm(email: string, password: string): Promise<boolean> {
    console.log(`[${this.serviceName}] Submitting login form`);
    
    // Configure axios to automatically follow redirects
    const originalMaxRedirects = client.defaults.maxRedirects;
    client.defaults.maxRedirects = 5;
    
    try {
      // Get the login page to extract any hidden fields
      console.log(`[${this.serviceName}] Getting login page to extract form fields`);
      const loginPageResponse = await client.get(this.artistLoginUrl);
      
      // Log response details
      console.log(`[${this.serviceName}] Login page response status: ${loginPageResponse.status}`);
      
      // Check for any cookies set in the login page response
      const loginPageCookies = loginPageResponse.headers['set-cookie'];
      if (loginPageCookies) {
        console.log(`[${this.serviceName}] Login page set cookies: ${loginPageCookies}`);
      } else {
        console.log(`[${this.serviceName}] No cookies set by login page`);
      }
      
      // Extract form fields
      console.log(`[${this.serviceName}] Extracting form fields from login page`);
      
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
        console.log(`[${this.serviceName}] Added __VIEWSTATE (${viewStateMatch[1].length} chars)`);
      }
      if (viewStateGeneratorMatch) {
        formData['__VIEWSTATEGENERATOR'] = viewStateGeneratorMatch[1];
        console.log(`[${this.serviceName}] Added __VIEWSTATEGENERATOR: ${viewStateGeneratorMatch[1]}`);
      }
      if (eventValidationMatch) {
        formData['__EVENTVALIDATION'] = eventValidationMatch[1];
        console.log(`[${this.serviceName}] Added __EVENTVALIDATION (${eventValidationMatch[1].length} chars)`);
      }
      
      console.log(`[${this.serviceName}] Form data keys: ${Object.keys(formData).join(', ')}`);
      
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
      
      // Log the request headers
      console.log(`[${this.serviceName}] Request headers: ${JSON.stringify(headers)}`);
      
      // Submit the login form
      console.log(`[${this.serviceName}] Submitting login form to ${this.artistLoginUrl}`);
      const response = await client.post(this.artistLoginUrl, formData, { headers });
      
      // Log response details
      console.log(`[${this.serviceName}] Response status: ${response.status}`);
      console.log(`[${this.serviceName}] Response headers: ${JSON.stringify(response.headers)}`);
      
      // Check for any cookies set in the response
      const responseCookies = response.headers['set-cookie'];
      if (responseCookies) {
        console.log(`[${this.serviceName}] Response set cookies: ${responseCookies}`);
        
        // Parse the cookies
        this.parseCookies(responseCookies);
      } else {
        console.log(`[${this.serviceName}] Response cookies: undefined`);
      }
      
      // Check if we've been redirected to a post-login page
      const finalUrl = response.request?.res?.responseUrl || '';
      
      console.log(`[${this.serviceName}] Login request completed with status ${response.status}`);
      console.log(`[${this.serviceName}] Final URL after redirects: ${finalUrl}`);
      
      // If the finalUrl doesn't include 'login', we were successfully redirected to a logged-in area
      this.isAuthenticated = response.status === 200 && !finalUrl.includes('/login');
      console.log(`[${this.serviceName}] Login ${this.isAuthenticated ? 'successful' : 'failed'}`);
      
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
   * Parse cookies from response headers
   */
  private parseCookies(cookieHeaders: string[]): void {
    console.log(`[${this.serviceName}] Parsing ${cookieHeaders.length} cookies...`);
    
    cookieHeaders.forEach((cookieStr, index) => {
      try {
        // Extract cookie name and value
        const cookieMain = cookieStr.split(';')[0];
        const [name, value] = cookieMain.split('=');
        
        console.log(`[${this.serviceName}] Cookie ${index + 1}: ${name}=${value}`);
        
        // Extract other cookie attributes
        const attributes: Record<string, string> = {};
        
        cookieStr.split(';').slice(1).forEach(attr => {
          const trimmedAttr = attr.trim();
          if (trimmedAttr.includes('=')) {
            const [key, val] = trimmedAttr.split('=');
            attributes[key.trim().toLowerCase()] = val;
          } else {
            attributes[trimmedAttr.toLowerCase()] = 'true';
          }
        });
        
        console.log(`[${this.serviceName}] Cookie ${name} attributes:`, JSON.stringify(attributes));
        
        // Check if this is an authentication cookie
        if (name.toLowerCase().includes('auth') || 
            name.toLowerCase().includes('session') || 
            name.toLowerCase().includes('id') ||
            name.toLowerCase().includes('asp')) {
          console.log(`[${this.serviceName}] Found potential authentication cookie: ${name}`);
        }
      } catch (error) {
        console.error(`[${this.serviceName}] Error parsing cookie: ${cookieStr}`, error);
      }
    });
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
        
        // Look for the select element with name="c"
        console.log(`[${this.serviceName}] Searching for select element with name="c"...`);
        const selectRegex = /<select[^>]*name="c"[^>]*>([\s\S]*?)<\/select>/i;
        const selectMatch = response.data.match(selectRegex);
        
        if (selectMatch && selectMatch[1]) {
          console.log(`[${this.serviceName}] Found select element with name="c"`);
          const selectContent = selectMatch[0]; // The entire select element
          console.log(`[${this.serviceName}] Select element: ${selectContent.substring(0, 100)}...`);
          
          // Extract all options
          const optionsRegex = /<option[^>]*value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/g;
          const options: { value: string; text: string }[] = [];
          let match;
          
          while ((match = optionsRegex.exec(selectContent)) !== null) {
            const value = match[1].trim();
            const text = match[2].trim();
            
            if (value || text) {
              options.push({ value, text });
            }
          }
          
          console.log(`[${this.serviceName}] Found ${options.length} options in select element`);
          
          // Print all options
          options.forEach((option, index) => {
            console.log(`[${this.serviceName}] Option ${index + 1}: Value="${option.value}" Text="${option.text}"`);
          });
        } else {
          console.log(`[${this.serviceName}] Select element with name="c" not found`);
          
          // Check if the element might be in a different page
          console.log(`[${this.serviceName}] Checking for links that might contain the select element...`);
          
          // Find links to potential pages where the select element might be
          const calendarLink = response.data.match(/href="([^"]*calendar[^"]*)"/i);
          const formLink = response.data.match(/href="([^"]*form[^"]*)"/i);
          const applicationsLink = response.data.match(/href="([^"]*application[^"]*)"/i);
          const artistAreaLink = response.data.match(/href="([^"]*artista[^"]*)"/i);
          
          const linksToCheck = [];
          
          if (calendarLink && calendarLink[1]) {
            const url = this.resolveUrl(calendarLink[1]);
            console.log(`[${this.serviceName}] Found link to calendar: ${url}`);
            linksToCheck.push(url);
          }
          
          if (formLink && formLink[1]) {
            const url = this.resolveUrl(formLink[1]);
            console.log(`[${this.serviceName}] Found link to form: ${url}`);
            linksToCheck.push(url);
          }
          
          if (applicationsLink && applicationsLink[1]) {
            const url = this.resolveUrl(applicationsLink[1]);
            console.log(`[${this.serviceName}] Found link to applications: ${url}`);
            linksToCheck.push(url);
          }
          
          if (artistAreaLink && artistAreaLink[1]) {
            const url = this.resolveUrl(artistAreaLink[1]);
            console.log(`[${this.serviceName}] Found link to artist area: ${url}`);
            linksToCheck.push(url);
          }
          
          // Check all links in sequence
          for (const url of linksToCheck) {
            await this.checkPageForSelectElement(url);
          }
        }
        
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
      
      // Create debug directory if it doesn't exist
      const debugDir = path.join(process.cwd(), 'debug');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      
      // Save HTML file
      const filepath = path.join(debugDir, filename);
      fs.writeFileSync(filepath, html);
      console.log(`[${this.serviceName}] Saved HTML to ${filepath}`);
    } catch (error) {
      console.error(`[${this.serviceName}] Error saving HTML for debugging:`, error);
    }
  }

  /**
   * Check a specific page for the select element
   */
  private async checkPageForSelectElement(url: string): Promise<void> {
    try {
      console.log(`[${this.serviceName}] Checking page at ${url} for select element...`);
      
      const response = await client.get(url, {
        maxRedirects: 5,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Referer': this.baseUrl,
        }
      });
      
      const finalUrl = response.request?.res?.responseUrl || url;
      console.log(`[${this.serviceName}] Page URL: ${finalUrl}`);
      console.log(`[${this.serviceName}] Page status: ${response.status}`);
      
      if (typeof response.data === 'string') {
        // Look for the select element with name="c"
        const selectRegex = /<select[^>]*name="c"[^>]*>([\s\S]*?)<\/select>/i;
        const selectMatch = response.data.match(selectRegex);
        
        if (selectMatch && selectMatch[0]) {
          console.log(`[${this.serviceName}] Found select element with name="c" on page: ${finalUrl}`);
          const selectContent = selectMatch[0]; // The entire select element
          
          // Extract all options
          const optionsRegex = /<option[^>]*value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/g;
          const options: { value: string; text: string }[] = [];
          let match;
          
          while ((match = optionsRegex.exec(selectContent)) !== null) {
            const value = match[1].trim();
            const text = match[2].trim();
            
            if (value || text) {
              options.push({ value, text });
            }
          }
          
          console.log(`[${this.serviceName}] Found ${options.length} options in select element`);
          
          // Print all options
          options.forEach((option, index) => {
            console.log(`[${this.serviceName}] Option ${index + 1}: Value="${option.value}" Text="${option.text}"`);
          });
          
          // Save this HTML for debugging
          this.saveHtmlForDebugging(response.data, `page-with-select-${new Date().getTime()}.html`);
        } else {
          console.log(`[${this.serviceName}] Select element with name="c" not found on page: ${finalUrl}`);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Error checking page for select element: ${errorMessage}`);
    }
  }

  /**
   * Resolve a relative URL to an absolute URL
   */
  private resolveUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    } else if (url.startsWith('/')) {
      // URL is absolute path
      return `${this.baseUrl}${url}`;
    } else {
      // URL is relative path
      return `${this.baseUrl}/${url}`;
    }
  }

  /**
   * Navigate to the artist timeline page
   */
  private async navigateToArtistTimeline(): Promise<void> {
    try {
      console.log(`[${this.serviceName}] Navigating to artist timeline page...`);
      
      // Get the session cookie
      const sessionCookie = this.getSessionCookie();
      console.log(`[${this.serviceName}] Using session cookie: ${sessionCookie || 'None'}`);
      
      // Try several possible URLs for the timeline page
      const urlsToTry = [
        `${this.baseUrl}/artista/timeline`,
        `${this.baseUrl}/artista/`,
        `${this.baseUrl}/artista/calendario`
      ];
      
      for (const url of urlsToTry) {
        console.log(`[${this.serviceName}] Trying URL: ${url}`);
        
        const headers: Record<string, string> = {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Referer': this.baseUrl,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0'
        };
        
        // Add cookie header if we have a session cookie
        if (sessionCookie) {
          headers['Cookie'] = sessionCookie;
        }
        
        const response = await client.get(url, {
          maxRedirects: 5,
          withCredentials: true,
          headers
        });
        
        const finalUrl = response.request?.res?.responseUrl || url;
        console.log(`[${this.serviceName}] Page URL: ${finalUrl}`);
        console.log(`[${this.serviceName}] Page status: ${response.status}`);
        
        if (response.status === 200 && typeof response.data === 'string') {
          // Save HTML for debugging
          const filename = `page-${url.replace(/[\/:.]/g, '-')}.html`;
          this.saveHtmlForDebugging(response.data, filename);
          
          // Check for the select element with name="c"
          const hasSelectC = this.checkForSelectElement(response.data, url);
          
          if (hasSelectC) {
            break; // We found what we needed, stop trying other URLs
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Error navigating to timeline page: ${errorMessage}`);
    }
  }

  /**
   * Get the session cookie
   */
  private getSessionCookie(): string | null {
    try {
      const { jar } = client.defaults;
      
      if (jar) {
        // Get cookies for the domain
        const cookieString = jar.getCookieStringSync(this.baseUrl);
        
        // Find ASP.NET session cookie
        const cookies = jar.getCookiesSync(this.baseUrl);
        const sessionCookie = cookies.find(cookie => 
          cookie.key.toLowerCase().includes('session') || 
          cookie.key.toLowerCase().includes('asp'));
        
        if (sessionCookie) {
          return `${sessionCookie.key}=${sessionCookie.value}`;
        }
        
        return cookieString || null;
      }
      
      return null;
    } catch (error) {
      console.error(`[${this.serviceName}] Error getting session cookie:`, error);
      return null;
    }
  }

  /**
   * Check a page for the select element with name="c"
   */
  private checkForSelectElement(html: string, url: string): boolean {
    try {
      // Check for select element with name="c" (for calendario)
      const hasSelectC = html.includes('<select name="c"') || 
                         html.includes("name='c'") || 
                         html.includes('name="nomeartista"') ||
                         html.includes("name='nomeartista'");
      
      if (hasSelectC) {
        console.log(`[${this.serviceName}] Found select element in URL: ${url}`);
        return true;
      } else {
        console.log(`[${this.serviceName}] No select element found in URL: ${url}`);
        // Check if we see login form again
        const hasLoginForm = html.includes('action="/web/login"') || 
                            html.includes('name="email"') && html.includes('name="senha"');
        
        if (hasLoginForm) {
          console.log(`[${this.serviceName}] Found login form - session may have expired`);
        }
        return false;
      }
    } catch (error) {
      console.error(`[${this.serviceName}] Error checking for select element:`, error);
      return false;
    }
  }

  /**
   * Log cookies in the cookie jar
   */
  private logCookies(): void {
    try {
      // Import the cookie jar from the Axios client
      const { jar } = client.defaults;
      
      if (jar) {
        console.log(`[${this.serviceName}] Checking cookie jar...`);
        
        // Get cookies for the domain
        const cookieString = jar.getCookieStringSync(this.baseUrl);
        console.log(`[${this.serviceName}] Cookie string for ${this.baseUrl}: ${cookieString || 'No cookies'}`);
        
        // Get all cookies
        const cookies = jar.getCookiesSync(this.baseUrl);
        console.log(`[${this.serviceName}] Found ${cookies.length} cookies`);
        
        // Log each cookie
        cookies.forEach((cookie, index) => {
          console.log(`[${this.serviceName}] Cookie ${index + 1}: ${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; Expires=${cookie.expires}; HttpOnly=${cookie.httpOnly}; Secure=${cookie.secure}`);
        });
      } else {
        console.log(`[${this.serviceName}] No cookie jar available`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Error logging cookies: ${errorMessage}`);
    }
  }

  /**
   * Navigate to the landing page after login
   */
  private async navigateToLandingPage(): Promise<void> {
    try {
      console.log(`[${this.serviceName}] Navigating to landing page...`);
      
      const landingUrl = `${this.baseUrl}/`;
      
      const headers: Record<string, string> = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Referer': `${this.baseUrl}/web/login?perfil=Artista`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0'
      };
      
      // Get the session cookie
      const sessionCookie = this.getSessionCookie();
      if (sessionCookie) {
        headers['Cookie'] = sessionCookie;
      }
      
      const response = await client.get(landingUrl, {
        maxRedirects: 5,
        withCredentials: true,
        headers
      });
      
      const finalUrl = response.request?.res?.responseUrl || landingUrl;
      console.log(`[${this.serviceName}] Landing page URL: ${finalUrl}`);
      console.log(`[${this.serviceName}] Landing page status: ${response.status}`);
      
      if (response.status === 200 && typeof response.data === 'string') {
        // Save HTML for debugging
        const filename = `page-landing.html`;
        this.saveHtmlForDebugging(response.data, filename);
        
        // Check if there's a logout link or user profile reference
        const hasLogoutLink = response.data.includes('logout') || response.data.includes('Logout');
        const hasUserProfile = response.data.includes('profile') || response.data.includes('Profile');
        
        console.log(`[${this.serviceName}] Landing page has logout link: ${hasLogoutLink}`);
        console.log(`[${this.serviceName}] Landing page has user profile reference: ${hasUserProfile}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Error navigating to landing page: ${errorMessage}`);
    }
  }
} 