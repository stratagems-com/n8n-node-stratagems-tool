# Get Last Updated

Retrieve a last updated record by key.

## Overview

The **Get Last Updated** operation allows you to retrieve a last updated record by its key. This is useful for checking when a specific operation or data source was last updated, which can help with scheduling jobs, monitoring data freshness, and preventing unnecessary updates.

## Use Cases

- **Job Scheduling**: Check when a job was last run to determine if it needs to run again
- **Data Freshness Monitoring**: Verify when data sources were last updated
- **Conditional Processing**: Only process data if it hasn't been updated recently
- **Audit Trails**: Track when operations were performed
- **Synchronization**: Check if data needs to be synchronized with external systems

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Unique identifier for the last updated record. Must contain only letters, numbers, hyphens, and underscores. Maximum 255 characters. |

## Response

### Success Response (Record Found)

```json
{
  "id": "lu_123456789",
  "key": "user-sync",
  "description": "Last time user data was synced from external system",
  "date": "2024-01-20T14:45:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
```

### Success Response (Record Not Found)

```json
null
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the record |
| `key` | string | The key identifier for the record |
| `description` | string \| null | Optional description of the record |
| `date` | string | ISO 8601 timestamp of the last update |
| `createdAt` | string | ISO 8601 timestamp when the record was created |
| `updatedAt` | string | ISO 8601 timestamp when the record was last updated |

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
  "error": "Failed to fetch last updated record",
  "code": "FETCH_ERROR"
}
```

## Examples

### Basic Usage

1. Configure the 8kit node with your API credentials
2. Select **Last Updated** as the resource
3. Select **Get Last Updated** as the operation
4. Enter the key (e.g., "user-sync")
5. Execute the workflow

### Job Scheduling Example

```javascript
// Example: Check if user sync job needs to run
const lastSync = await getLastUpdated("user-sync");

if (!lastSync) {
  // No previous sync record, run the job
  console.log("No previous sync found, running user sync...");
  await performUserSync();
  await createLastUpdated("user-sync", "User data synced from external system");
} else {
  const lastSyncTime = new Date(lastSync.date);
  const now = new Date();
  const hoursSinceLastSync = (now - lastSyncTime) / (1000 * 60 * 60);
  
  if (hoursSinceLastSync >= 24) {
    // It's been more than 24 hours, run the sync
    console.log("User sync is stale, running sync...");
    await performUserSync();
    await createLastUpdated("user-sync", "User data synced from external system");
  } else {
    console.log("User sync is recent, skipping...");
  }
}
```

### Data Freshness Monitoring Example

```javascript
// Example: Monitor data freshness for multiple sources
const dataSources = [
  { key: "user-sync", maxAgeHours: 24 },
  { key: "product-catalog", maxAgeHours: 6 },
  { key: "order-data", maxAgeHours: 1 }
];

for (const source of dataSources) {
  const lastUpdate = await getLastUpdated(source.key);
  
  if (!lastUpdate) {
    console.log(`No previous update found for ${source.key}`);
    continue;
  }
  
  const lastUpdateTime = new Date(lastUpdate.date);
  const now = new Date();
  const hoursSinceUpdate = (now - lastUpdateTime) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate > source.maxAgeHours) {
    console.log(`WARNING: ${source.key} is stale (${hoursSinceUpdate.toFixed(1)} hours old)`);
    // Send alert or trigger refresh
  } else {
    console.log(`${source.key} is fresh (${hoursSinceUpdate.toFixed(1)} hours old)`);
  }
}
```

### Conditional Processing Example

```javascript
// Example: Only process data if it hasn't been updated recently
async function processDataIfNeeded(dataKey, maxAgeMinutes = 30) {
  const lastUpdate = await getLastUpdated(dataKey);
  
  if (!lastUpdate) {
    console.log(`No previous update found for ${dataKey}, processing...`);
    await processData(dataKey);
    await createLastUpdated(dataKey, `Data processed for ${dataKey}`);
    return;
  }
  
  const lastUpdateTime = new Date(lastUpdate.date);
  const now = new Date();
  const minutesSinceUpdate = (now - lastUpdateTime) / (1000 * 60);
  
  if (minutesSinceUpdate >= maxAgeMinutes) {
    console.log(`${dataKey} is stale (${minutesSinceUpdate.toFixed(1)} minutes old), processing...`);
    await processData(dataKey);
    await createLastUpdated(dataKey, `Data processed for ${dataKey}`);
  } else {
    console.log(`${dataKey} is recent (${minutesSinceUpdate.toFixed(1)} minutes old), skipping...`);
  }
}
```

### Audit Trail Example

```javascript
// Example: Create audit trail for operations
async function performOperationWithAudit(operationKey, operationDescription) {
  console.log(`Starting operation: ${operationDescription}`);
  
  try {
    // Perform the operation
    await performOperation();
    
    // Record successful completion
    await createLastUpdated(operationKey, operationDescription);
    console.log(`Operation completed successfully: ${operationDescription}`);
    
  } catch (error) {
    console.error(`Operation failed: ${operationDescription}`, error);
    // Optionally record failure
    await createLastUpdated(`${operationKey}-failed`, `Failed: ${operationDescription}`);
    throw error;
  }
}

// Usage
await performOperationWithAudit("daily-backup", "Daily database backup completed");
await performOperationWithAudit("user-import", "User data import from CSV completed");
```

## Best Practices

### Use Descriptive Keys

```javascript
// Good: Descriptive keys
await getLastUpdated("user-sync-daily");
await getLastUpdated("product-catalog-update");
await getLastUpdated("order-processing-batch");

// Avoid: Generic keys
await getLastUpdated("update1");
await getLastUpdated("sync");
```

### Handle Null Responses

```javascript
// Good: Handle null responses properly
const lastUpdate = await getLastUpdated("my-operation");

if (lastUpdate) {
  console.log(`Last updated: ${lastUpdate.date}`);
  console.log(`Description: ${lastUpdate.description || 'No description'}`);
} else {
  console.log("No previous update found");
}
```

### Use Consistent Key Naming

```javascript
// Good: Consistent naming convention
const operationKeys = {
  userSync: "user-sync",
  productCatalog: "product-catalog",
  orderProcessing: "order-processing"
};

// Usage
const userSyncStatus = await getLastUpdated(operationKeys.userSync);
const productStatus = await getLastUpdated(operationKeys.productCatalog);
```

## Notes

- If no record exists for the given key, the operation returns `null`
- The operation is read-only and does not modify any records
- Use this operation to check data freshness before performing expensive operations
- Combine with **Add New Last Updated** to create a complete tracking system
- The date field represents when the operation was last performed
- This operation is useful for building intelligent scheduling and monitoring systems 