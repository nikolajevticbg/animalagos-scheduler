import dotenv from 'dotenv';
import { Scheduler } from './scheduler';

// Load environment variables
dotenv.config();

/**
 * Main entry point for the Animalagos Scheduler
 */
async function main(): Promise<void> {
  console.log(`[Animalagos] Starting Animalagos Scheduler...`);
  
  // Create and start the scheduler
  const scheduler = new Scheduler();
  
  // Credentials for login
  const email = 'gitaroholicar@gmail.com';
  const password = '8707613';
  
  // Process the April reservations
  await scheduler.start(email, password);
  
  console.log(`[Animalagos] Scheduler completed.`);
}

// Run the main function
main().catch(error => {
  console.error('[Animalagos] Unhandled error:', error);
  process.exit(1);
}); 