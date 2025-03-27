import { CookieJar, Cookie } from 'tough-cookie';

/**
 * Service for managing authentication sessions
 */
export class SessionService {
  private static instance: SessionService;
  private cookieJar: CookieJar = new CookieJar();
  private readonly serviceName = 'SessionService';

  private constructor() {
    this.initializeCookieJar();
  }

  /**
   * Get singleton instance of SessionService
   */
  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Initialize a new cookie jar
   */
  private initializeCookieJar(): void {
    this.cookieJar = new CookieJar();
    console.log(`[${this.serviceName}] Initializing session service with new cookie jar`);
  }

  /**
   * Get the cookie jar for storing session cookies
   */
  getCookieJar(): CookieJar {
    console.log(`[${this.serviceName}] Providing cookie jar for client`);
    return this.cookieJar;
  }

  /**
   * Clear all session cookies
   */
  async clearSession(): Promise<void> {
    console.log(`[${this.serviceName}] Clearing all cookies and creating new cookie jar`);
    this.initializeCookieJar();
  }

  /**
   * Get a specific cookie from the jar
   * @param url URL to get cookie for
   * @param name Cookie name
   */
  async getCookie(url: string, name: string): Promise<string | null> {
    try {
      return await this.findCookieByName(url, name);
    } catch (error: unknown) {
      this.handleCookieError(error, 'getting');
      return null;
    }
  }

  /**
   * Find a cookie by name in the jar
   */
  private async findCookieByName(url: string, name: string): Promise<string | null> {
    console.log(`[${this.serviceName}] Getting cookie '${name}' for URL: ${url}`);
    const cookies = await this.cookieJar.getCookies(url);
    const cookie = cookies.find((c: Cookie) => c.key === name);
    
    if (cookie) {
      console.log(`[${this.serviceName}] Cookie '${name}' found`);
      return cookie.value;
    }
    
    console.log(`[${this.serviceName}] Cookie '${name}' not found`);
    return null;
  }

  /**
   * Add a cookie to the jar
   * @param url URL to set cookie for
   * @param name Cookie name
   * @param value Cookie value
   */
  async setCookie(url: string, name: string, value: string): Promise<void> {
    try {
      await this.storeCookie(url, name, value);
    } catch (error: unknown) {
      this.handleCookieError(error, 'setting');
      throw new Error(`Failed to set cookie: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store a cookie in the jar
   */
  private async storeCookie(url: string, name: string, value: string): Promise<void> {
    console.log(`[${this.serviceName}] Setting cookie '${name}' for URL: ${url}`);
    await this.cookieJar.setCookie(`${name}=${value}`, url);
    console.log(`[${this.serviceName}] Cookie '${name}' set successfully`);
  }

  /**
   * Handle cookie operation errors
   */
  private handleCookieError(error: unknown, operation: string): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${this.serviceName}] Error ${operation} cookie: ${errorMessage}`);
  }
} 