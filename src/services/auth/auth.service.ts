import { client } from '../../config/axios.config';

/**
 * Authentication service for Animalagos portal
 */
export class AuthService {
  private static instance: AuthService;
  private isAuthenticated = false;
  private readonly baseUrl = 'https://animalagos.com/web';
  private readonly loginUrl: string;
  private readonly serviceName = 'AuthService';

  private constructor() {
    this.loginUrl = `${this.baseUrl}/login?perfil=Artista`;
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
    try {
      await this.getLoginPage();
      return await this.submitLoginForm(credentials);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Authentication error: ${errorMessage}`);
      throw new Error(`Authentication failed: ${errorMessage}`);
    }
  }

  /**
   * Get the login page to capture session cookies
   */
  private async getLoginPage(): Promise<void> {
    console.log(`[${this.serviceName}] Attempting to get login page at ${this.loginUrl}`);
    await client.get(this.loginUrl);
  }

  /**
   * Submit the login form with credentials
   */
  private async submitLoginForm(credentials: { email: string; password: string }): Promise<boolean> {
    console.log(`[${this.serviceName}] Submitting login form`);
    const response = await client.post(`${this.baseUrl}/login`, {
      email: credentials.email,
      password: credentials.password,
      remember: 'on', // "Memorizar" checkbox
      terms: 'on'     // "I've read and accept terms & conditions" checkbox
    });
    
    this.isAuthenticated = response.status === 200;
    console.log(`[${this.serviceName}] Login ${this.isAuthenticated ? 'successful' : 'failed'}`);
    return this.isAuthenticated;
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
      return await this.checkDashboardAccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.serviceName}] Session validation error: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Check if we can access the dashboard page
   */
  private async checkDashboardAccess(): Promise<boolean> {
    console.log(`[${this.serviceName}] Validating session by accessing dashboard`);
    const response = await client.get(`${this.baseUrl}/dashboard`);
    const isValid = response.status === 200;
    console.log(`[${this.serviceName}] Session validation ${isValid ? 'successful' : 'failed'}`);
    return isValid;
  }
} 