# Animalagos Scheduler

Automated scheduling system for performance locations in Lagos, Portugal. This system handles the automated booking of performance locations during a critical 2-minute window at midnight GMT/Lisbon time at the end of each month.

## Features

- Automated scheduling at midnight GMT/Lisbon
- Priority-based location booking
- Session-based authentication
- Retry mechanism for failed bookings
- Comprehensive error handling and logging

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TypeScript

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nikolajevticbg/animalagos-scheduler.git
cd animalagos-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the required environment variables:
```env
API_BASE_URL=https://api.animalagos.com
AUTH_TIMEOUT_MS=30000
SCHEDULING_WINDOW_MINUTES=2
MAX_RETRIES=3
```

## Development

Start the development server:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

## Building

Build the project:
```bash
npm run build
```

## License

MIT 