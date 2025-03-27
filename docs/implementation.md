# Implementation Plan for Performance Location Scheduling System

## 1. Overview of Key Requirements
- Automated scheduling system running at midnight GMT/Lisbon
- 2-minute execution window for booking multiple locations
- Priority-based scheduling with retry mechanisms
- Session-based authentication persistence
- Comprehensive error handling and logging

## 2. Architecture & Folder Structure

```plaintext
src/
├── config/
│   ├── axios.config.ts
│   └── constants.ts
├── types/
│   ├── location.types.ts
│   └── scheduling.types.ts
├── services/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── session.service.ts
│   ├── scheduling/
│   │   ├── scheduler.service.ts
│   │   └── location.service.ts
│   └── monitoring/
│       └── logger.service.ts
├── utils/
│   ├── time.utils.ts
│   └── retry.utils.ts
├── middleware/
│   ├── error.middleware.ts
│   └── auth.middleware.ts
└── tests/
    ├── unit/
    └── integration/
```

## 3. Implementation Breakdown

### 3.1 Core Types and Interfaces

```typescript
// src/types/location.types.ts
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
```

### 3.2 Axios Configuration with Cookie Support

```typescript
// src/config/axios.config.ts
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

export const client = wrapper(axios.create({
  jar,
  withCredentials: true,
  baseURL: process.env.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
}));

// Global error interceptor
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      return handleAuthError(error);
    }
    return Promise.reject(error);
  }
);
```

### 3.3 Authentication Service

```typescript
// src/services/auth/auth.service.ts
import { client } from '../../config/axios.config';

export class AuthService {
  private static instance: AuthService;
  private isAuthenticated = false;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: { username: string; password: string }): Promise<boolean> {
    try {
      const response = await client.post('/auth/login', credentials);
      this.isAuthenticated = response.status === 200;
      return this.isAuthenticated;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const response = await client.get('/auth/validate');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
```

### 3.4 Scheduler Service

```typescript
// src/services/scheduling/scheduler.service.ts
import { Location, SchedulingResult } from '../../types/location.types';
import { client } from '../../config/axios.config';
import { retry } from '../../utils/retry.utils';

export class SchedulerService {
  private readonly maxRetries: number;
  private readonly timeoutMs: number;

  constructor(config: { maxRetries: number; timeoutMs: number }) {
    this.maxRetries = config.maxRetries;
    this.timeoutMs = timeoutMs;
  }

  async scheduleLocation(location: Location): Promise<SchedulingResult> {
    return retry(
      async () => {
        const response = await client.post('/scheduling/book', {
          locationId: location.id,
          timeSlot: location.timeSlot
        });
        
        return {
          locationId: location.id,
          success: true,
          timestamp: new Date()
        };
      },
      {
        retries: this.maxRetries,
        timeout: this.timeoutMs
      }
    );
  }

  async scheduleAllLocations(locations: Location[]): Promise<SchedulingResult[]> {
    const sortedLocations = [...locations].sort((a, b) => a.priority - b.priority);
    const results: SchedulingResult[] = [];

    for (const location of sortedLocations) {
      try {
        const result = await this.scheduleLocation(location);
        results.push(result);
      } catch (error) {
        results.push({
          locationId: location.id,
          success: false,
          error,
          timestamp: new Date()
        });
      }
    }

    return results;
  }
}
```

## 4. Error Handling Middleware

```typescript
// src/middleware/error.middleware.ts
import { AxiosError } from 'axios';

export interface ApiError extends Error {
  code: string;
  status: number;
}

export const handleApiError = (error: AxiosError): ApiError => {
  return {
    name: 'ApiError',
    message: error.response?.data?.message || error.message,
    code: error.response?.data?.code || 'UNKNOWN_ERROR',
    status: error.response?.status || 500
  };
};
```

## 5. Dependencies Required

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "axios-cookiejar-support": "^4.0.7",
    "tough-cookie": "^4.1.3",
    "date-fns": "^2.30.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/tough-cookie": "^4.0.5",
    "@types/node": "^20.8.0",
    "typescript": "^5.2.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.5"
  }
}
```

## 6. Testing Strategy

### Unit Tests Example

```typescript
// src/tests/unit/scheduler.service.test.ts
import { SchedulerService } from '../../services/scheduling/scheduler.service';
import { mockClient } from '../mocks/axios.mock';

describe('SchedulerService', () => {
  let service: SchedulerService;

  beforeEach(() => {
    service = new SchedulerService({
      maxRetries: 3,
      timeoutMs: 5000
    });
  });

  test('should schedule location successfully', async () => {
    const mockLocation = {
      id: '123',
      priority: 1,
      timeSlot: { start: '10:00', end: '11:00' }
    };

    const result = await service.scheduleLocation(mockLocation);
    expect(result.success).toBe(true);
    expect(result.locationId).toBe(mockLocation.id);
  });
});
```

## 7. Security Considerations

1. Cookie Security Configuration:
```typescript
// src/config/cookie.config.ts
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 3600 * 1000 // 1 hour
};
```

2. Environment Variables:
```plaintext
# .env.example
API_BASE_URL=https://api.animalagos.com
AUTH_TIMEOUT_MS=30000
SCHEDULING_WINDOW_MINUTES=2
MAX_RETRIES=3
```

This implementation plan provides a solid foundation for building the scheduling system. The architecture is modular, type-safe, and follows best practices for session management and error handling. The use of Axios with cookie support ensures reliable authentication persistence, while the retry mechanisms help handle the critical scheduling window effectively. 