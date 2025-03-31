import { AnimalagosService } from './services/minimal-form-service';
import { ScheduleEntry, aprilSchedule } from './scheduler-config';

/**
 * Scheduler for processing Animalagos reservations
 */
export class Scheduler {
  private service: AnimalagosService;
  private isLoggedIn: boolean = false;
  private schedule: ScheduleEntry[];
  private readonly delayBetweenRequests: number = 1000; // 2 seconds delay between requests

  constructor(schedule: ScheduleEntry[] = aprilSchedule) {
    this.service = AnimalagosService.getInstance();
    this.schedule = schedule;
  }

  /**
   * Start the scheduler for processing reservations
   */
  async start(email: string, password: string): Promise<void> {
    console.log(`[Scheduler] Starting reservation scheduler...`);
    
    try {
      // Login first
      this.isLoggedIn = await this.login(email, password);
      
      if (!this.isLoggedIn) {
        console.error(`[Scheduler] Unable to login. Stopping scheduler.`);
        return;
      }
      
      // Process each reservation in the schedule
      await this.processSchedule();
      
      console.log(`[Scheduler] All reservations processed successfully.`);
    } catch (error) {
      console.error(`[Scheduler] Error processing reservations: ${error}`);
    }
  }

  /**
   * Login to the Animalagos system
   */
  private async login(email: string, password: string): Promise<boolean> {
    console.log(`[Scheduler] Logging in with ${email}...`);
    return await this.service.login(email, password);
  }

  /**
   * Process the entire schedule
   */
  private async processSchedule(): Promise<void> {
    console.log(`[Scheduler] Processing ${this.schedule.length} reservations...`);
    
    // Track results
    let successCount = 0;
    let failureCount = 0;
    
    // Process each entry in order
    for (let i = 0; i < this.schedule.length; i++) {
      const entry = this.schedule[i];
      
      console.log(`[Scheduler] Processing reservation ${i+1}/${this.schedule.length}: ${entry.day} at ${entry.location} (${entry.timeSlot})`);
      
      try {
        const result = await this.submitReservation(entry);
        
        if (result.status === 200) {
          console.log(`[Scheduler] ✅ Successfully reserved: ${entry.day} at ${entry.location} (${entry.timeSlot})`);
          successCount++;
        } else {
          console.log(`[Scheduler] ❌ Failed to reserve: ${entry.day} at ${entry.location} (${entry.timeSlot}). Status: ${result.status}`);
          failureCount++;
        }
        
        // Add delay between requests to avoid overwhelming the server
        if (i < this.schedule.length - 1) {
          console.log(`[Scheduler] Waiting ${this.delayBetweenRequests}ms before next reservation...`);
          await this.delay(this.delayBetweenRequests);
        }
      } catch (error) {
        console.error(`[Scheduler] Error processing reservation: ${error}`);
        failureCount++;
      }
    }
    
    // Print summary
    console.log(`[Scheduler] Reservation processing complete.`);
    console.log(`[Scheduler] Success: ${successCount}, Failures: ${failureCount}`);
  }

  /**
   * Submit a single reservation
   */
  private async submitReservation(entry: ScheduleEntry): Promise<any> {
    const formData = {
      g: entry.day,            // Date
      c: entry.location,       // Location
      i: entry.timeSlot        // Time slot
    };
    
    return await this.service.submitArtistRegistration(formData);
  }

  /**
   * Utility to create a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 