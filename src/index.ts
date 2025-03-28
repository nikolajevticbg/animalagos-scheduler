import dotenv from 'dotenv';
import { AuthService } from './services/auth/auth.service';
import * as fs from 'fs';
import * as path from 'path';
import { Credentials } from './types/credentials';

// Load environment variables
dotenv.config();

/**
 * Main function to run the application
 */
async function main(): Promise<void> {
  console.log(`[Scheduler] Starting Animalagos Scheduler...`);
  
  // Initialize services
  const authService = AuthService.getInstance();
  
  // Set up credentials for logging in
  const credentials: Credentials = {
    email: 'gitaroholicar@gmail.com',
    password: '8707613'
  };
  
  try {
    console.log(`[Scheduler] Logging in to Animalagos portal...`);
    const isLoggedIn = await authService.login(credentials.email, credentials.password);
    
    if (isLoggedIn) {
      console.log(`[Scheduler] Successfully logged in to Animalagos portal!`);
      
      // Validate the session
      console.log(`[Scheduler] Validating session...`);
      const isSessionValid = await authService.validateSession();
      
      if (isSessionValid) {
        console.log(`[Scheduler] Session is valid`);
        
        // Navigate to the artist timeline page
        console.log(`[Scheduler] Navigating to artist timeline page...`);
        const timelineSuccess = await authService.navigateToTimelinePage();
        
        if (timelineSuccess) {
          console.log(`[Scheduler] Successfully accessed the artist timeline data`);
          
          // Check the HTML debug file to extract artist and location data
          const debugFolder = path.join(process.cwd(), 'debug');
          const timelineFile = path.join(debugFolder, 'timeline_access_attempt.html');
          
          if (fs.existsSync(timelineFile)) {
            console.log(`[Scheduler] Analyzing timeline data from ${timelineFile}`);
            const htmlContent = fs.readFileSync(timelineFile, 'utf8');
            
            // Count artists
            const artistMatch = htmlContent.match(/<option>([^<]+)<\/option>/g);
            const artistCount = artistMatch ? artistMatch.length - 2 : 0; // Subtract the "Artista" and "Todos" options
            
            // Count locations
            const locationMatch = htmlContent.match(/<option>([^<]+)<\/option>\s+<\/select>/);
            const locationStartIndex = htmlContent.indexOf('<option  value="">Rua/ Praça</option>');
            const locationEndIndex = htmlContent.indexOf('</select>', locationStartIndex);
            const locationSection = htmlContent.substring(locationStartIndex, locationEndIndex);
            const locationCount = (locationSection.match(/<option>/g) || []).length - 2; // Subtract the "Rua/ Praça" and "Todos" options
            
            console.log(`[Scheduler] Found ${artistCount} artists and ${locationCount} locations in the timeline data`);
            console.log(`[Scheduler] Ready to implement scheduling functionality`);
          }
        } else {
          console.log(`[Scheduler] Failed to access the artist timeline data`);
        }
      } else {
        console.log(`[Scheduler] Session validation failed`);
      }
    } else {
      console.log(`[Scheduler] Failed to log in to Animalagos portal`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Scheduler] Error: ${errorMessage}`);
  }
  
  console.log(`[Scheduler] System ready.`);
}

/**
 * Save debug info to a file
 */
export function saveDebugInfo(data: any, filename: string): void {
  try {
    // Create debug directory if it doesn't exist
    const debugDir = path.join(process.cwd(), 'debug');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }
    
    // Write the data to a file
    const filePath = path.join(debugDir, filename);
    fs.writeFileSync(filePath, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    console.log(`[Scheduler] Saved debug info to ${filePath}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Scheduler] Error saving debug info: ${errorMessage}`);
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