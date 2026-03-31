# Request ID Tracking with CLS (Continuation Local Storage)

This application now includes automatic request ID tracking using Node.js's AsyncLocalStorage for maintaining context across async operations.

## Overview

Every HTTP request that enters the application is automatically assigned a unique UUID request ID that persists throughout the entire request lifecycle, including:
- All service calls
- Database operations
- External API calls
- Log messages
- Error handling

## How it Works

1. **Middleware**: `RequestContextMiddleware` wraps each incoming request in a CLS context with a unique request ID
2. **Logger Integration**: The Winston logger automatically includes the request ID in all log messages
3. **Easy Access**: Services can access the current request ID at any time using the provided utilities

## Features

- ✅ Automatic request ID generation (UUID v4)
- ✅ Request ID included in all log messages (console and Loki)
- ✅ Request ID sent in response headers (`X-Request-ID`)
- ✅ Works across all async operations
- ✅ No manual passing of request ID needed
- ✅ Thread-safe context isolation

## Usage Examples

### In Services
```typescript
import { getCurrentRequestId } from '../utils/request-context.util';

@Injectable()
export class MyService {
  async someMethod() {
    const requestId = getCurrentRequestId();
    console.log(`Processing request: ${requestId}`);
    
    // The logger will automatically include the request ID
    this.logger.info('This log will include the request ID');
  }
}
```

### In Controllers (using decorators)
```typescript
import { GetRequestId, GetRequestContext } from '../decorators/request-id.decorator';

@Controller('example')
export class ExampleController {
  @Get()
  async getExample(@GetRequestId() requestId: string) {
    console.log(`Current request ID: ${requestId}`);
    return { requestId };
  }

  @Post()
  async createExample(@GetRequestContext() context: RequestContext) {
    console.log(`Request started at: ${context.timestamp}`);
    console.log(`Request ID: ${context.requestId}`);
    return { success: true };
  }
}
```

### Using the Logger
The logger will automatically include request IDs:

```typescript
// Before (without request ID)
[info] : User login successful : [Dec-18-2024 14:30:45]

// After (with request ID)
[info] [a1b2c3d4-e5f6-7890-abcd-ef1234567890] : User login successful : [Dec-18-2024 14:30:45]
```

## Technical Implementation

### Core Components

1. **ClsContextService**: Manages the AsyncLocalStorage context
2. **RequestContextMiddleware**: Initializes context for each request
3. **Logger Configuration**: Enhanced to include request IDs
4. **Utility Functions**: Easy access to context from anywhere

### Files Modified/Added

- `src/services/cls-context.service.ts` - Core CLS service
- `src/middleware/request-context.middleware.ts` - Request initialization middleware  
- `src/configs/logger.ts` - Enhanced logger with request ID support
- `src/utils/request-context.util.ts` - Utility functions
- `src/decorators/request-id.decorator.ts` - Parameter decorators
- `src/app.module.ts` - Module configuration

## Benefits

1. **Improved Debugging**: Easily trace all logs for a specific request
2. **Better Monitoring**: Correlate logs across services and operations
3. **Automatic Tracking**: No need to manually pass request IDs through function calls
4. **Performance**: Minimal overhead using Node.js native AsyncLocalStorage
5. **Backward Compatible**: Existing code continues to work without changes

## Response Headers

The system automatically adds the request ID to response headers:
```
X-Request-ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

This allows frontend applications to correlate client-side events with server-side logs.

## Grafana/Loki Integration

Request IDs are automatically included in structured logs sent to Loki, allowing for powerful log queries:

```json
{
  "level": "info",
  "message": "User login successful",
  "timestamp": "2024-12-18T14:30:45.123Z",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

Query example in Grafana:
```
{app="smoll-api"} | json | requestId="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
``` 