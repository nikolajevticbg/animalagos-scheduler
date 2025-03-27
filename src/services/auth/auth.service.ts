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
      }

      // Submit the login form with credentials
      const loginSuccess = await this.submitLoginForm(email, password);
      
      if (!loginSuccess) {
        console.log(`[${this.serviceName}] Login unsuccessful`);
        return false;
      }
      
      // Get session cookie after login
      const sessionCookie = this.getSessionCookie();
      
      if (!sessionCookie) {
        console.error(`[${this.serviceName}] No session cookie found after successful login`);
        return false;
      }
      
      // Navigate to the landing page
      await this.navigateToLandingPage();
      
      // Navigate to the artist timeline page
      await this.navigateToArtistTimeline();
      
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
      
      // Extract form fields
      
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
      
      // Check for any cookies set in the response
      const responseCookies = response.headers['set-cookie'];
      if (responseCookies) {
        this.parseCookies(responseCookies);
      }
      
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
   * Parse cookies from response headers
   */
  private parseCookies(cookieHeaders: string[]): void {
    const { jar } = client.defaults;
    if (!jar) {
      return;
    }
    
    for (const cookieStr of cookieHeaders) {
      try {
        const cookie = Cookie.parse(cookieStr);
        if (cookie) {
          jar.setCookieSync(cookie, this.baseUrl);
        }
      } catch (error) {
        console.error(`[${this.serviceName}] Error parsing cookie: ${error}`);
      }
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
   * Get the session cookie
   */
  private getSessionCookie(): string | null {
    const { jar } = client.defaults;
    if (!jar) {
      return null;
    }
    
    const cookies = jar.getCookiesSync(this.baseUrl);
    const sessionCookies = cookies.filter(cookie => {
      return cookie.key === 'ASP.NET_SessionId' || 
             cookie.key === '.ASPXAUTH' || 
             cookie.key.includes('session');
    });
    
    if (sessionCookies.length === 0) {
      return null;
    }
    
    return sessionCookies[0].toString();
  }

  /**
   * Navigate to the landing page after login
   */
  private async navigateToLandingPage(): Promise<void> {
    try {
      // Define the landing page URL
      const url = `${this.baseUrl}/artista/`;
      
      // Navigate to the landing page
      const response = await client.get(url, {
        headers: {
          'Referer': this.artistLoginUrl,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      
      // Check if we received a good response
      if (response.status !== 200) {
        throw new Error(`Failed to navigate to landing page. Status code: ${response.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Error navigating to landing page: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Navigate to the artist timeline page
   */
  private async navigateToArtistTimeline(): Promise<void> {
    try {
      // Define the timeline page URL
      const url = `${this.baseUrl}/artista/timeline`;
      
      // Navigate to the timeline page
      const response = await client.get(url, {
        headers: {
          'Referer': `${this.baseUrl}/artista/`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      
      // Check if we received a good response
      if (response.status !== 200) {
        throw new Error(`Failed to navigate to artist timeline. Status code: ${response.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Error navigating to artist timeline: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get all available locations (streets/plazas)
   */
  async getLocations(): Promise<{ id: string; name: string }[]> {
    try {
      // Navigate to the calendar page to get location information
      const url = `${this.baseUrl}/artista/calendario`;
      const response = await client.get(url);
      
      // Check if we received a good response
      if (response.status !== 200) {
        throw new Error(`Failed to navigate to calendar page. Status code: ${response.status}`);
      }
      
      // Extract locations from HTML
      const locations = this.extractLocationsFromHtml(response.data);
      
      // If no locations found in HTML, try extracting from JavaScript
      if (locations.length === 0) {
        return this.extractLocationsFromJavaScript(response.data);
      }
      
      return locations;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Error getting locations: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Extract locations from HTML
   */
  private extractLocationsFromHtml(html: string): { id: string; name: string }[] {
    try {
      // Direct extraction of nomerua select element
      const nomeruaSelectRegex = /<select[^>]*name="nomerua"[^>]*>[\s\S]*?<\/select>/i;
      const nomeruaMatch = html.match(nomeruaSelectRegex);
      
      if (nomeruaMatch && nomeruaMatch[0]) {
        console.log(`[${this.serviceName}] Found nomerua select element, extracting options`);
        const selectContent = nomeruaMatch[0];
        
        // Extract options directly
        const options: { id: string; name: string }[] = [];
        const optionsRegex = /<option(?:\s+value="([^"]*)")?\s*>([^<]*)<\/option>/g;
        let match;
        
        while ((match = optionsRegex.exec(selectContent)) !== null) {
          const id = match[1] || '';
          const rawName = match[2] || '';
          
          // Fix encoding issues (Latin1/Windows-1252 encoded characters)
          const name = this.fixEncoding(rawName).trim();
          
          if (name && name !== 'Rua/ Praça' && name !== 'Todos' && name !== 'Rua/ Praça') {
            console.log(`[${this.serviceName}] Found location: "${name}" (ID: "${id}")`);
            options.push({ id: id || name, name });
          }
        }
        
        if (options.length > 0) {
          console.log(`[${this.serviceName}] Extracted ${options.length} locations from nomerua select`);
          return options;
        }
      }
      
      const locations: { id: string; name: string }[] = [];
      
      // Look for different possible select elements for locations
      const selectNames = ['nomerua', 'c', 'rua', 'street', 'location'];
      
      for (const name of selectNames) {
        // Try with double quotes
        const regex1 = new RegExp(`<select[^>]*name="${name}"[^>]*>[\\s\\S]*?<\\/select>`, 'i');
        // Try with single quotes
        const regex2 = new RegExp(`<select[^>]*name='${name}'[^>]*>[\\s\\S]*?<\\/select>`, 'i');
        
        let selectMatch = html.match(regex1) || html.match(regex2);
        
        if (selectMatch && selectMatch[0]) {
          console.log(`[${this.serviceName}] Found select element with name="${name}"`);
          const selectContent = selectMatch[0];
          console.log(`[${this.serviceName}] Select content (first 100 chars): ${selectContent.substring(0, 100)}...`);
          
          // Try different option patterns
          const optionPatterns = [
            /<option[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/g,
            /<option[^>]*value=([\w\d]+)[^>]*>([\s\S]*?)<\/option>/g
          ];
          
          for (const pattern of optionPatterns) {
            let match;
            const tempLocations: { id: string; name: string }[] = [];
            
            while ((match = pattern.exec(selectContent)) !== null) {
              const id = match[1].trim();
              let name = match[2].trim();
              
              // Remove any HTML entities and normalize whitespace
              name = name.replace(/&[a-z]+;/g, ' ')
                         .replace(/\s+/g, ' ')
                         .replace(/<[^>]*>/g, '')
                         .trim();
              
              if (id && name) {
                tempLocations.push({ id, name });
              }
            }
            
            if (tempLocations.length > 0) {
              console.log(`[${this.serviceName}] Extracted ${tempLocations.length} locations from select name="${name}"`);
              
              // Log a few locations as a sample
              const sampleSize = Math.min(tempLocations.length, 5);
              for (let i = 0; i < sampleSize; i++) {
                console.log(`[${this.serviceName}] Location ${i + 1}: ID="${tempLocations[i].id}" Name="${tempLocations[i].name}"`);
              }
              
              locations.push(...tempLocations);
              break;
            }
          }
          
          if (locations.length > 0) {
            break;
          }
        }
      }
      
      // If we still don't have locations, try a more aggressive approach
      if (locations.length === 0) {
        console.log(`[${this.serviceName}] Using more aggressive option extraction`);
        
        // Find any <option> elements that might be part of a location dropdown
        const optionRegex = /<option[^>]*value=["']([^"']*)["'][^>]*>((?:Rua|Praça|Avenida|Largo|R\.|Av\.)[\s\S]*?)<\/option>/g;
        let match;
        
        while ((match = optionRegex.exec(html)) !== null) {
          const id = match[1].trim();
          let name = match[2].trim();
          
          // Clean the name
          name = name.replace(/&[a-z]+;/g, ' ')
                    .replace(/\s+/g, ' ')
                    .replace(/<[^>]*>/g, '')
                    .trim();
          
          if (id && name) {
            locations.push({ id, name });
          }
        }
        
        if (locations.length > 0) {
          console.log(`[${this.serviceName}] Found ${locations.length} locations using aggressive extraction`);
          
          // Log a sample
          const sampleSize = Math.min(locations.length, 5);
          for (let i = 0; i < sampleSize; i++) {
            console.log(`[${this.serviceName}] Location ${i + 1}: ID="${locations[i].id}" Name="${locations[i].name}"`);
          }
        }
      }
      
      return locations;
    } catch (error) {
      console.error(`[${this.serviceName}] Error extracting locations:`, error);
      return [];
    }
  }

  /**
   * Fix encoding issues in text
   */
  private fixEncoding(text: string): string {
    return text
      // Common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Special Portuguese characters
      .replace(/\u00E7|\u00C7/g, 'ç') // ç/Ç
      .replace(/\u00E1|\u00C1/g, 'á') // á/Á
      .replace(/\u00E9|\u00C9/g, 'é') // é/É
      .replace(/\u00ED|\u00CD/g, 'í') // í/Í
      .replace(/\u00F3|\u00D3/g, 'ó') // ó/Ó
      .replace(/\u00FA|\u00DA/g, 'ú') // ú/Ú
      .replace(/\u00E2|\u00C2/g, 'â') // â/Â
      .replace(/\u00EA|\u00CA/g, 'ê') // ê/Ê
      .replace(/\u00F4|\u00D4/g, 'ô') // ô/Ô
      .replace(/\u00E3|\u00C3/g, 'ã') // ã/Ã
      .replace(/\u00F5|\u00D5/g, 'õ') // õ/Õ
      // Fix problematic characters
      .replace(/Pra.a/g, 'Praça')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract locations from JavaScript data in the HTML
   */
  private extractLocationsFromJavaScript(html: string): { id: string; name: string }[] {
    try {
      const locations: { id: string; name: string }[] = [];
      
      // Look for JavaScript arrays containing locations
      // Pattern 1: var arrayRuas = [ {'value': 'value1', 'text': 'text1'}, ... ]
      const arrayPattern1 = /var\s+array(?:Ruas|Locais|Streets|Locations)\s*=\s*\[(.*?)\];/s;
      const arrayMatch1 = html.match(arrayPattern1);
      
      if (arrayMatch1 && arrayMatch1[1]) {
        console.log(`[${this.serviceName}] Found JavaScript array of locations`);
        
        // Extract each location object
        const objectPattern = /{\s*['"]value['"]\s*:\s*['"]([^'"]*)['"]\s*,\s*['"]text['"]\s*:\s*['"]([^'"]*)['"]\s*}/g;
        let match;
        
        while ((match = objectPattern.exec(arrayMatch1[1])) !== null) {
          const id = match[1].trim();
          const name = match[2].trim();
          
          if (id && name) {
            locations.push({ id, name });
          }
        }
      }
      
      // Pattern 2: Options directly embedded in JavaScript
      if (locations.length === 0) {
        // Look for option arrays like: ['Option 1', 'Option 2', ...]
        const optionArrayPattern = /\[(['"][^'"]*['"](?:\s*,\s*['"][^'"]*['"])*)\]/g;
        let arrayMatch;
        
        while ((arrayMatch = optionArrayPattern.exec(html)) !== null) {
          const optionsString = arrayMatch[1];
          const options = optionsString.split(',').map(opt => 
            opt.trim().replace(/^['"]|['"]$/g, '')
          );
          
          // If this looks like a list of locations, use it
          const hasLocationNames = options.some(opt => 
            opt.includes('Rua') || 
            opt.includes('Praça') || 
            opt.includes('Avenida') ||
            opt.includes('Largo'));
          
          if (hasLocationNames) {
            options.forEach((name, index) => {
              if (name.trim()) {
                locations.push({ 
                  id: String(index + 1), 
                  name: name.trim() 
                });
              }
            });
            break;
          }
        }
      }
      
      // Pattern 3: Look for select population code
      if (locations.length === 0) {
        const selectPopulationPattern = /\$\(["']#(?:rua|location|street|c|nomerua)["']\)\.append\(["']<option[^>]*value=["']([^"']*)["'][^>]*>(.*?)<\/option>["']\)/g;
        let match;
        
        while ((match = selectPopulationPattern.exec(html)) !== null) {
          const id = match[1].trim();
          const name = match[2].replace(/\\["']/g, '').trim();
          
          if (id && name) {
            locations.push({ id, name });
          }
        }
      }
      
      return locations;
    } catch (error) {
      console.error(`[${this.serviceName}] Error extracting locations from JavaScript:`, error);
      return [];
    }
  }
} 