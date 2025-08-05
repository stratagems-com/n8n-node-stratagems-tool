# Add New Last Updated

Create a new last updated record with current timestamp.

## Overview

The **Add New Last Updated** operation allows you to create a new last updated record to track when an operation or data source was last updated. This is useful for building audit trails, scheduling jobs, and monitoring data freshness.

## Use Cases

- **Audit Trails**: Record when operations are completed
- **Job Scheduling**: Mark when jobs are finished to prevent re-running
- **Data Freshness Tracking**: Record when data sources are updated
- **Synchronization Tracking**: Track when data is synced with external systems
- **Monitoring**: Create timestamps for monitoring and alerting systems

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | Unique identifier for the last updated record. Must contain only letters, numbers, hyphens, and underscores. Maximum 255 characters. |
| `description` | string | No | Optional human-readable description explaining the purpose of this record. Maximum 500 characters. |
| `date` | string | No | Optional custom date in ISO 8601 format (e.g., "2024-01-15T10:30:00.000Z"). If not specified, current timestamp will be used. |

## Response

### Success Response

```json
{
  "id": "lu_123456789",
  "key": "user-sync",
  "description": "User data synced from external system",
  "date": "2024-01-20T14:45:00.000Z",
  "createdAt": "2024-01-20T14:45:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
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

### 409 Conflict (Duplicate Key)
```json
{
  "success": false,
  "error": "A record with this key already exists",
  "code": "DUPLICATE_KEY",
  "data": {
    "key": "user-sync"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create last updated record",
  "code": "CREATION_ERROR"
}
```

## Examples

### Basic Usage

1. Configure the 8kit node with your API credentials
2. Select **Last Updated** as the resource
3. Select **Add New Last Updated** as the operation
4. Enter the key (e.g., "user-sync")
5. Optionally add a description
6. Optionally specify a custom date
7. Execute the workflow

### Job Completion Tracking Example

```javascript
// Example: Track when a job completes
async function runUserSyncJob() {
  try {
    console.log("Starting user sync job...");
    
    // Perform the user sync operation
    await performUserSync();
    
    // Record successful completion
    const record = await createLastUpdated(
      "user-sync",
      "User data synced from external system"
    );
    
    console.log(`User sync completed at ${record.date}`);
    return record;
    
  } catch (error) {
    console.error("User sync failed:", error);
    
    // Optionally record failure
    await createLastUpdated(
      "user-sync-failed",
      `User sync failed: ${error.message}`
    );
    
    throw error;
  }
}
```

### Data Source Update Tracking Example

```javascript
// Example: Track when data sources are updated
async function updateProductCatalog() {
  const startTime = new Date();
  
  try {
    // Update product catalog
    await fetchAndUpdateProducts();
    
    // Record the update with custom timestamp
    const record = await createLastUpdated(
      "product-catalog",
      "Product catalog updated from external API",
      startTime.toISOString()
    );
    
    console.log(`Product catalog updated at ${record.date}`);
    return record;
    
  } catch (error) {
    console.error("Product catalog update failed:", error);
    throw error;
  }
}
```

### Batch Operation Tracking Example

```javascript
// Example: Track multiple operations in a batch
async function processBatchOperations() {
  const operations = [
    { key: "user-sync", description: "User data synchronization" },
    { key: "product-update", description: "Product catalog update" },
    { key: "order-processing", description: "Order data processing" }
  ];
  
  const results = [];
  
  for (const operation of operations) {
    try {
      // Perform the operation
      await performOperation(operation.key);
      
      // Record completion
      const record = await createLastUpdated(
        operation.key,
        operation.description
      );
      
      results.push({
        operation: operation.key,
        success: true,
        timestamp: record.date
      });
      
    } catch (error) {
      console.error(`Operation ${operation.key} failed:`, error);
      
      // Record failure
      await createLastUpdated(
        `${operation.key}-failed`,
        `Failed: ${operation.description} - ${error.message}`
      );
      
      results.push({
        operation: operation.key,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}
```

### Scheduled Job Tracking Example

```javascript
// Example: Track scheduled jobs with custom timestamps
async function runScheduledJobs() {
  const now = new Date();
  const jobs = [
    {
      key: "daily-backup",
      description: "Daily database backup completed",
      schedule: "daily"
    },
    {
      key: "weekly-report",
      description: "Weekly analytics report generated",
      schedule: "weekly"
    },
    {
      key: "monthly-cleanup",
      description: "Monthly data cleanup completed",
      schedule: "monthly"
    }
  ];
  
  for (const job of jobs) {
    try {
      // Check if job should run based on schedule
      const shouldRun = await shouldRunJob(job.key, job.schedule);
      
      if (shouldRun) {
        // Perform the job
        await performJob(job.key);
        
        // Record completion with current timestamp
        await createLastUpdated(
          job.key,
          job.description,
          now.toISOString()
        );
        
        console.log(`${job.key} completed successfully`);
      } else {
        console.log(`${job.key} not due to run yet`);
      }
      
    } catch (error) {
      console.error(`${job.key} failed:`, error);
      
      // Record failure
      await createLastUpdated(
        `${job.key}-failed`,
        `Failed: ${job.description} - ${error.message}`,
        now.toISOString()
      );
    }
  }
}
```

### Custom Date Example

```javascript
// Example: Record operations with custom dates
async function recordHistoricalData() {
  // Record a past operation
  await createLastUpdated(
    "historical-migration",
    "Historical data migration completed",
    "2024-01-15T10:30:00.000Z"
  );
  
  // Record a future scheduled operation
  await createLastUpdated(
    "scheduled-maintenance",
    "Scheduled maintenance window",
    "2024-02-01T02:00:00.000Z"
  );
  
  // Record current operation
  await createLastUpdated(
    "current-operation",
    "Current operation completed"
    // No date specified - uses current timestamp
  );
}
```

## Best Practices

### Use Descriptive Keys and Descriptions

```javascript
// Good: Clear and descriptive
await createLastUpdated(
  "user-sync-daily",
  "Daily user data synchronization from CRM system"
);

await createLastUpdated(
  "product-catalog-update",
  "Product catalog updated from external API"
);

// Avoid: Generic and unclear
await createLastUpdated("sync", "sync");
await createLastUpdated("update", "updated");
```

### Handle Duplicate Key Errors

```javascript
// Good: Handle duplicate key errors gracefully
try {
  await createLastUpdated("my-operation", "Operation completed");
} catch (error) {
  if (error.code === "DUPLICATE_KEY") {
    console.log("Record already exists, updating instead...");
    // Use update operation or handle differently
  } else {
    throw error;
  }
}
```

### Use Consistent Naming Conventions

```javascript
// Good: Consistent naming convention
const operationKeys = {
  userSync: "user-sync",
  productUpdate: "product-update",
  orderProcessing: "order-processing"
};

// Usage
await createLastUpdated(operationKeys.userSync, "User sync completed");
await createLastUpdated(operationKeys.productUpdate, "Product update completed");
```

### Combine with Get Last Updated

```javascript
// Good: Check before creating to avoid duplicates
async function recordOperationIfNeeded(key, description) {
  const existing = await getLastUpdated(key);
  
  if (!existing) {
    await createLastUpdated(key, description);
    console.log(`Created new record for ${key}`);
  } else {
    console.log(`Record already exists for ${key}, skipping creation`);
  }
}
```

## Notes

- Each key must be unique - attempting to create a record with an existing key will result in an error
- If no date is specified, the current timestamp will be used
- The description field is optional but recommended for better documentation
- Use this operation in combination with **Get Last Updated** to build complete tracking systems
- This operation is useful for building audit trails and monitoring systems
- The created record can be retrieved later using the same key 