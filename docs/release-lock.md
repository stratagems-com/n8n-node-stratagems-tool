# Release Lock

Release a specific lock by key.

## Overview

The **Release Lock** operation allows you to release a distributed lock that was previously acquired. This is essential for freeing up resources and allowing other processes to acquire the same lock.

## Use Cases

- **Resource Cleanup**: Release locks when operations are complete
- **Error Recovery**: Release locks when operations fail
- **Manual Lock Management**: Manually release locks that may be stuck
- **System Maintenance**: Clean up locks during system maintenance
- **Debugging**: Release locks for testing and debugging purposes

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Unique identifier for the lock to release. Must contain only letters, numbers, hyphens, and underscores. Maximum 255 characters. |

## Response

### Success Response (Lock Released)

```json
{
  "key": "db-migration-v2",
  "released": true,
  "timestamp": "2024-01-20T15:30:00.000Z"
}
```

### Success Response (Lock Not Found)

```json
{
  "key": "db-migration-v2",
  "released": false,
  "timestamp": "2024-01-20T15:30:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | The lock key that was attempted to release |
| `released` | boolean | Whether the lock was successfully released |
| `timestamp` | string | ISO 8601 timestamp of the release operation |

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to release lock",
  "code": "LOCK_RELEASE_ERROR"
}
```

## Examples

### Basic Usage

1. Configure the 8kit node with your API credentials
2. Select **Lock** as the resource
3. Select **Release Lock** as the operation
4. Enter the lock key (e.g., "db-migration-v2")
5. Execute the workflow

### Complete Lock Lifecycle Example

```javascript
// Example: Complete lock lifecycle
const lockKey = "db-migration-v2";

try {
  // 1. Acquire the lock
  const acquireResult = await acquireLock(lockKey, 300);
  
  if (acquireResult.acquired) {
    try {
      // 2. Perform the critical operation
      await performDatabaseMigration();
      console.log("Migration completed successfully");
    } finally {
      // 3. Always release the lock when done
      const releaseResult = await releaseLock(lockKey);
      if (releaseResult.released) {
        console.log("Lock released successfully");
      } else {
        console.log("Lock was already released or didn't exist");
      }
    }
  } else {
    console.log("Could not acquire lock, operation skipped");
  }
} catch (error) {
  console.error("Error during lock operation:", error);
  // Attempt to release lock even if operation failed
  try {
    await releaseLock(lockKey);
  } catch (releaseError) {
    console.error("Failed to release lock:", releaseError);
  }
}
```

### Error Recovery Example

```javascript
// Example: Release locks in error scenarios
async function performOperationWithLock(lockKey) {
  const lockResult = await acquireLock(lockKey, 600);
  
  if (!lockResult.acquired) {
    throw new Error("Could not acquire lock");
  }
  
  try {
    // Perform the operation
    await performCriticalOperation();
    return "Operation completed successfully";
  } catch (error) {
    // Release lock even if operation fails
    await releaseLock(lockKey);
    throw error; // Re-throw the error
  } finally {
    // Ensure lock is released
    await releaseLock(lockKey);
  }
}
```

### Cleanup Example

```javascript
// Example: Clean up multiple locks
async function cleanupLocks(lockKeys) {
  const results = [];
  
  for (const lockKey of lockKeys) {
    try {
      const result = await releaseLock(lockKey);
      results.push({
        key: lockKey,
        released: result.released,
        success: true
      });
    } catch (error) {
      results.push({
        key: lockKey,
        released: false,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Usage
const locksToCleanup = ["db-migration-v2", "file-processing", "data-sync"];
const cleanupResults = await cleanupLocks(locksToCleanup);

console.log("Cleanup results:", cleanupResults);
```

### Monitoring and Debugging Example

```javascript
// Example: Monitor and release stale locks
async function monitorAndCleanupLocks() {
  const locksToCheck = ["db-migration-v2", "file-processing", "data-sync"];
  
  for (const lockKey of locksToCheck) {
    // First check if lock exists
    const lockStatus = await checkLock(lockKey);
    
    if (lockStatus.exists) {
      const lockAge = Date.now() - new Date(lockStatus.lockInfo.timestamp).getTime();
      const maxAge = 3600000; // 1 hour in milliseconds
      
      if (lockAge > maxAge) {
        console.log(`Releasing stale lock: ${lockKey} (age: ${lockAge}ms)`);
        const releaseResult = await releaseLock(lockKey);
        
        if (releaseResult.released) {
          console.log(`Successfully released stale lock: ${lockKey}`);
        }
      } else {
        console.log(`Lock ${lockKey} is still active (age: ${lockAge}ms)`);
      }
    } else {
      console.log(`Lock ${lockKey} does not exist`);
    }
  }
}
```

## Best Practices

### Always Release Locks in Finally Blocks

```javascript
// Good: Use finally to ensure lock is always released
const lockResult = await acquireLock("my-lock");
if (lockResult.acquired) {
  try {
    await performOperation();
  } finally {
    await releaseLock("my-lock");
  }
}
```

### Handle Release Failures Gracefully

```javascript
// Good: Handle release failures
try {
  await releaseLock("my-lock");
  console.log("Lock released successfully");
} catch (error) {
  console.warn("Failed to release lock:", error.message);
  // Continue with workflow - don't let release failure stop the process
}
```

### Use Descriptive Logging

```javascript
// Good: Log lock operations for debugging
const releaseResult = await releaseLock("db-migration-v2");
console.log(`Lock release result: ${releaseResult.released ? 'success' : 'not found'}`);
```

## Notes

- This operation is idempotent - releasing a non-existent lock will not cause an error
- Always release locks when operations are complete to prevent resource leaks
- Use this operation in error handling to ensure locks are released even when operations fail
- The operation returns whether the lock was actually released or if it didn't exist
- This operation is atomic and thread-safe
- Locks can only be released by the same app that acquired them 