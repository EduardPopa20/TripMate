# TripMate Shared Utilities

Shared code used across all TripMate microservices.

## Structure

```
shared/
├── config/
│   ├── supabaseClient.js    # Supabase client configuration
│   └── redisClient.js        # Redis client with helper functions
├── middleware/
│   └── errorHandler.js       # Express error handling middleware
├── utils/
│   └── logger.js             # Winston logger configuration
├── package.json
├── .env.example
└── README.md
```

## Installation

From the `shared/` directory:

```bash
npm install
```

## Usage in Services

### 1. Logger

```javascript
const logger = require('../../shared/utils/logger');

logger.info('Service started');
logger.error('An error occurred', { error: err.message });
logger.debug('Debug information', { data });
```

**Log Levels**: error, warn, info, debug

**Environment Variables**:
- `LOG_LEVEL` - Logging level (default: info)
- `SERVICE_NAME` - Service identifier for logs

### 2. Error Handler

```javascript
const errorHandler = require('../../shared/middleware/errorHandler');
const express = require('express');

const app = express();

// ... your routes ...

// Add error handler as last middleware
app.use(errorHandler);
```

### 3. Supabase Client

```javascript
const supabase = require('../../shared/config/supabaseClient');

// Query database
const { data, error } = await supabase
  .from('trips')
  .select('*')
  .eq('user_id', userId);

if (error) throw error;
```

**Environment Variables Required**:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 4. Redis Client

```javascript
const {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  flushCache
} = require('../../shared/config/redisClient');

// Connect (do this at service startup)
await connectRedis();

// Get from cache
const cachedData = await getCache('weather:Paris');

// Set cache with TTL (900 seconds = 15 minutes)
await setCache('weather:Paris', weatherData, 900);

// Delete key
await deleteCache('weather:Paris');

// Clear all cache
await flushCache();
```

**Environment Variables**:
- `REDIS_URL` - Redis connection string (default: redis://localhost:6379)

## Environment Setup

Each service using shared utilities should have:

```bash
# .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
NODE_ENV=development
SERVICE_NAME=my-service
```

## Error Handling Pattern

```javascript
const express = require('express');
const logger = require('../../shared/utils/logger');
const errorHandler = require('../../shared/middleware/errorHandler');

const app = express();

// Routes
app.get('/api/example', async (req, res, next) => {
  try {
    // Your logic
    const result = await someOperation();
    res.json({ data: result });
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// Error handler (must be last)
app.use(errorHandler);
```

## Development vs Production

### Development
- Console logging with colors
- Detailed error responses with stack traces
- Debug logs enabled

### Production
- File logging (error.log, combined.log)
- Sanitized error responses
- Info/Error logs only

## Testing

```bash
npm test
```

## Dependencies

- `winston` - Logging
- `@supabase/supabase-js` - Database client
- `redis` - Cache client

---

**Last Updated**: 2025-12-15
