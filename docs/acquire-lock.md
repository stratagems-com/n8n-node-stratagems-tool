# Acquire Lock

Attempt to acquire a lock for resource coordination.

## Overview

The **Acquire Lock** operation allows you to attempt to acquire a distributed lock for coordinating access to shared resources. This is useful for preventing concurrent access to critical operations like database migrations, file processing, or data synchronization.

## Use Cases

- **Database Migrations**: Prevent multiple instances from running migrations simultaneously
- **File Processing**: Ensure only one process handles a specific file at a time
- **Data Synchronization**: Coordinate data sync operations across multiple systems
- **Resource Coordination**: Prevent race conditions in distributed systems
- **Critical Operations**: Ensure exclusive access to sensitive operations

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Unique identifier for the lock. Must contain only letters, numbers, hyphens, and underscores. Maximum 255 characters. |
| `timeout` | number | No | Optional timeout in seconds (1-3600). If not specified, the lock will not expire automatically. |

## Response

### Success Response (Lock Acquired)

```json
{
  "key": "db-migration-v2",
  "callingFn": "migrateUsers",
  "acquired": true,
  "timestamp": "2024-01-20T14:45:00.000Z",
  "timeout": 300
}
```

### Success Response (Lock Not Acquired)

```json
{
  "key": "db-migration-v2",
  "callingFn": "migrateUsers",
  "acquired": false
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | The lock key that was attempted |
| `callingFn` | string | Name of the calling function (automatically set) |
| `acquired` | boolean | Whether the lock was successfully acquired |
| `timestamp` | string | ISO 8601 timestamp when the lock was acquired (if successful) |
| `timeout` | number | Timeout in seconds (if specified) |

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

### 409 Conflict (Lock Already Exists)
```json
{
  "success": false,
  "error": "Lock already exists or is being processed",
  "code": "LOCK_CONFLICT",
  "data": {
    "key": "db-migration-v2",
    "callingFn": "migrateUsers",
    "acquired": false
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to acquire lock",
  "code": "LOCK_ACQUISITION_ERROR"
}
```

## Examples

### Basic Usage

1. Configure the 8kit node with your API credentials
2. Select **Lock** as the resource
3. Select **Acquire Lock** as the operation
4. Enter the lock key (e.g., "db-migration-v2")
5. Optionally set a timeout (e.g., 300 seconds)
6. Execute the workflow

### Database Migration Example

```javascript
// Example: Acquire lock for database migration
const lockResult = await acquireLock("db-migration-v2", 300);

if (lockResult.acquired) {
  try {
    // Perform database migration
    await performMigration();
    console.log("Migration completed successfully");
  } finally {
    // Always release the lock when done
    await releaseLock("db-migration-v2");
  }
} else {
  console.log("Migration already in progress, skipping...");
}
```

### File Processing Example

```javascript
// Example: Process files with lock coordination
const fileName = "large-data-file.csv";
const lockKey = `file-processing-${fileName}`;

const lockResult = await acquireLock(lockKey, 1800); // 30 minute timeout

if (lockResult.acquired) {
  try {
    // Process the file
    await processFile(fileName);
    console.log("File processing completed");
  } finally {
    // Release the lock
    await releaseLock(lockKey);
  }
} else {
  console.log("File is already being processed by another instance");
}
```

### Retry Logic Example

```javascript
// Example: Retry acquiring lock with exponential backoff
async function acquireLockWithRetry(key, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await acquireLock(key, 300);
    
    if (result.acquired) {
      return result;
    }
    
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`Lock acquisition failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Failed to acquire lock after maximum retries");
}
```

## Best Practices

### Always Release Locks

```javascript
// Good: Always release locks in finally block
const lockResult = await acquireLock("my-lock");
if (lockResult.acquired) {
  try {
    // Perform critical operation
    await performCriticalOperation();
  } finally {
    // Always release the lock
    await releaseLock("my-lock");
  }
}
```

### Use Descriptive Lock Keys

```javascript
// Good: Descriptive lock keys
await acquireLock("user-sync-2024-01-20");
await acquireLock("database-backup-nightly");
await acquireLock("file-processing-large-dataset");

// Avoid: Generic lock keys
await acquireLock("lock1");
await acquireLock("temp");
```

### Set Appropriate Timeouts

```javascript
// Short operations: 5-15 minutes
await acquireLock("quick-sync", 300);

// Medium operations: 15-60 minutes
await acquireLock("data-processing", 1800);

// Long operations: 1-6 hours
await acquireLock("full-backup", 21600);
```

## Notes

- Locks are automatically associated with your authenticated app
- If a lock already exists, the acquisition will fail
- Use timeouts to prevent locks from becoming permanent if processes crash
- Always release locks when operations are complete
- Locks are case-sensitive and must follow the naming convention
- This operation is atomic and thread-safe 