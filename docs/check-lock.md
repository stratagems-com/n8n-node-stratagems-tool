# Check Lock

Check if a specific lock exists and get its details.

## Overview

The **Check Lock** operation allows you to check if a specific lock exists and retrieve its details, including information about when it was acquired, by which function, and its timeout settings.

## Use Cases

- **Lock Status Verification**: Check if a lock exists before attempting to acquire it
- **Debugging**: Investigate lock conflicts and understand lock state
- **Monitoring**: Monitor active locks in your system
- **Conditional Logic**: Make decisions based on lock existence
- **Cleanup**: Identify stale locks that need to be released

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Unique identifier for the lock. Must contain only letters, numbers, hyphens, and underscores. Maximum 255 characters. |

## Response

### Success Response (Lock Exists)

```json
{
  "key": "db-migration-v2",
  "exists": true,
  "lockInfo": {
    "key": "db-migration-v2",
    "callingFn": "migrateUsers",
    "timestamp": "2024-01-20T14:45:00.000Z",
    "timeoutSeconds": 300,
    "appId": "app_123456789"
  },
  "timestamp": "2024-01-20T14:50:00.000Z"
}
```

### Success Response (Lock Does Not Exist)

```json
{
  "key": "db-migration-v2",
  "exists": false,
  "lockInfo": null,
  "timestamp": "2024-01-20T14:50:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | The lock key that was checked |
| `exists` | boolean | Whether the lock exists |
| `lockInfo` | object \| null | Lock details if it exists, null otherwise |
| `lockInfo.key` | string | The lock key |
| `lockInfo.callingFn` | string | Name of the function that acquired the lock |
| `lockInfo.timestamp` | string | ISO 8601 timestamp when the lock was acquired |
| `lockInfo.timeoutSeconds` | number | Timeout in seconds (if set) |
| `lockInfo.appId` | string | ID of the app that acquired the lock |
| `timestamp` | string | ISO 8601 timestamp of the check |

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
  "error": "Failed to check lock",
  "code": "LOCK_CHECK_ERROR"
}
```

## Examples

### Basic Usage

1. Configure the 8kit node with your API credentials
2. Select **Lock** as the resource
3. Select **Check Lock** as the operation
4. Enter the lock key (e.g., "db-migration-v2")
5. Execute the workflow

### Conditional Logic

```javascript
// Example: Only acquire lock if it doesn't exist
if (!lockCheck.exists) {
  // Proceed to acquire the lock
  await acquireLock("db-migration-v2");
} else {
  // Wait or take alternative action
  console.log("Lock already exists, waiting...");
}
```

### Monitoring Active Locks

```javascript
// Example: Check multiple locks and report status
const locksToCheck = ["db-migration-v2", "file-processing", "data-sync"];

for (const lockKey of locksToCheck) {
  const lockStatus = await checkLock(lockKey);
  
  if (lockStatus.exists) {
    console.log(`Lock ${lockKey} is active since ${lockStatus.lockInfo.timestamp}`);
  } else {
    console.log(`Lock ${lockKey} is available`);
  }
}
```

### Debugging Lock Conflicts

```javascript
// Example: Investigate lock details for debugging
const lockStatus = await checkLock("problematic-lock");

if (lockStatus.exists) {
  console.log("Lock details:", {
    acquiredBy: lockStatus.lockInfo.callingFn,
    acquiredAt: lockStatus.lockInfo.timestamp,
    timeout: lockStatus.lockInfo.timeoutSeconds,
    appId: lockStatus.lockInfo.appId
  });
}
```

## Notes

- This operation is read-only and does not modify any locks
- Use this operation before attempting to acquire locks to avoid conflicts
- The lock information includes details about which app and function acquired the lock
- Timeout information helps identify if locks might expire soon
- This operation is useful for monitoring and debugging distributed systems 