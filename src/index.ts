import dotenv from 'dotenv';
import { AuthService } from './services/auth/auth.service';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

/**
 * Main function to run the application
 */
async function main(): Promise<void> {
  try {
    console.log('[Scheduler] Starting Animalagos Scheduler...');
    
    const credentials = getCredentials();
    const authService = await performAuthentication(credentials);
    
    // Get available locations
    console.log('[Scheduler] Getting available locations...');
    const locations = await authService.getLocations();
    
    if (locations.length > 0) {
      console.log(`[Scheduler] Found ${locations.length} locations:`);
      locations.forEach((location, index) => {
        console.log(`[Scheduler] ${index + 1}. ${location.name} (ID: ${location.id})`);
      });
      
      // Save locations to a JSON file
      saveLocationsToFile(locations);
    } else {
      console.error('[Scheduler] No locations found');
    }
    
    console.log('[Scheduler] System ready.');
    
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
async function performAuthentication(credentials: { email: string; password: string }): Promise<AuthService> {
  const authService = AuthService.getInstance();
  
  console.log('[Scheduler] Logging in to Animalagos portal...');
  const isLoggedIn = await authService.login(credentials.email, credentials.password);
  
  if (!isLoggedIn) {
    console.error('[Scheduler] Failed to login to Animalagos portal!');
    process.exit(1);
    return authService;
  }
  
  console.log('[Scheduler] Successfully logged in to Animalagos portal!');
  await validateSession(authService);
  return authService;
}

/**
 * Validate the current session
 */
async function validateSession(authService: AuthService): Promise<void> {
  console.log('[Scheduler] Validating session...');
  const isSessionValid = await authService.validateSession();
  console.log(`[Scheduler] Session is ${isSessionValid ? 'valid' : 'invalid'}`);
}

/**
 * Save locations to a JSON file
 */
function saveLocationsToFile(locations: { id: string; name: string }[]): void {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write the data to a file
    const filePath = path.join(dataDir, 'locations.json');
    fs.writeFileSync(filePath, JSON.stringify(locations, null, 2));
    console.log(`[Scheduler] Saved ${locations.length} locations to ${filePath}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Scheduler] Error saving locations to file: ${errorMessage}`);
  }
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