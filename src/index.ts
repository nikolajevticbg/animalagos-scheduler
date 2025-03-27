import dotenv from 'dotenv';
import { AuthService } from './services/auth/auth.service';

// Load environment variables
dotenv.config();

/**
 * Main function to run the application
 */
async function main(): Promise<void> {
  try {
    console.log('[Scheduler] Starting Animalagos Scheduler...');
    
    const credentials = getCredentials();
    await performAuthentication(credentials);
    
    console.log('[Scheduler] Login successful. System ready.');
    
  } catch (error: unknown) {
    handleError(error);
    process.exit(1);
  }
}

/**
 * Get credentials from environment variables
 */
function getCredentials(): { email: string; password: string } {
  const email = process.env.ANIMALAGOS_EMAIL;
  const password = process.env.ANIMALAGOS_PASSWORD;
  
  if (!email || !password) {
    throw new Error('Missing required environment variables: ANIMALAGOS_EMAIL and/or ANIMALAGOS_PASSWORD');
  }
  
  return { email, password };
}

/**
 * Perform authentication to the Animalagos portal
 */
async function performAuthentication(credentials: { email: string; password: string }): Promise<void> {
  const authService = AuthService.getInstance();
  
  console.log('[AuthService] Logging in to Animalagos portal...');
  const isLoggedIn = await authService.login(credentials);
  
  if (!isLoggedIn) {
    console.error('[AuthService] Failed to login to Animalagos portal!');
    process.exit(1);
    return;
  }
  
  console.log('[AuthService] Successfully logged in to Animalagos portal!');
  await validateSession(authService);
}

/**
 * Validate the current session
 */
async function validateSession(authService: AuthService): Promise<void> {
  console.log('[AuthService] Validating session...');
  const isSessionValid = await authService.validateSession();
  console.log(`[AuthService] Session is ${isSessionValid ? 'valid' : 'invalid'}`);
}

/**
 * Handle errors in the application
 */
function handleError(error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  console.error(`[Scheduler] Error: ${errorMessage}`);
}

// Run the application
main().catch(error => {
  console.error('[Scheduler] Unhandled error:', error);
  process.exit(1);
}); 