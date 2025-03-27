export interface Location {
  id: string;
  name: string;
  priority: number;
  timeSlot: {
    start: string;
    end: string;
  };
  retryCount: number;
}

export interface SchedulingResult {
  locationId: string;
  success: boolean;
  error?: Error;
  timestamp: Date;
}

export interface SchedulingConfig {
  locations: Location[];
  maxRetries: number;
  timeoutThreshold: number;
  monthYear: string;
} 