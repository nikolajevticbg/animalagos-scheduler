import dotenv from 'dotenv';
import { AnimalagosService } from './services/minimal-form-service';

// Load environment variables
dotenv.config();

/**
 * Example of using the minimal Animalagos service
 */
async function main(): Promise<void> {
  console.log(`[Example] Starting minimal Animalagos example...`);
  
  // Initialize service
  const animalagosService = AnimalagosService.getInstance();
  
  // Set up credentials for logging in
  const email = 'gitaroholicar@gmail.com';
  const password = '8707613';
  
  try {
    // Login
    console.log(`[Example] Logging in to Animalagos portal...`);
    const isLoggedIn = await animalagosService.login(email, password);
    
    if (isLoggedIn) {
      console.log(`[Example] Successfully logged in to Animalagos portal!`);
      
      // Submit registration form for a time slot
      console.log(`[Example] Submitting artist registration form for time slot...`);
      try {
        const response = await animalagosService.submitArtistRegistration({ 
          i: "19:00 19:30" // Time slot
        });
        
        if (response.status === 200) {
          console.log(`[Example] Successfully submitted registration form!`);
        } else {
          console.log(`[Example] Form submission failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error(`[Example] Error submitting form:`, error);
      }
    } else {
      console.log(`[Example] Failed to log in to Animalagos portal`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Example] Error: ${errorMessage}`);
  }
  
  console.log(`[Example] Done.`);
}

// Run the example
main().catch(error => {
  console.error('[Example] Unhandled error:', error);
  process.exit(1);
}); 