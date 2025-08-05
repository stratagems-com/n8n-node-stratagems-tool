# Remove Value from Set

## Name
**Remove Value from Set** - Removes a specific value from an existing set in the 8kit system.

## Description
The Remove Value from Set operation allows you to remove individual values from a specified set within the 8kit automation platform. This operation is useful for cleaning up sets, removing outdated data, or managing set contents dynamically.

### Scenarios
- **Data Cleanup**: Removing outdated or invalid values from sets
- **User Management**: Removing users who have unsubscribed or been deactivated
- **Set Maintenance**: Cleaning up sets by removing unwanted entries
- **Data Correction**: Removing incorrect or duplicate values from sets

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the set to remove the value from | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |
| `value` | string | Yes | The value to remove from the set | - Must be a non-empty string<br>- Maximum 255 characters |

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the `value` parameter.

## Operation

### How it Works
1. **Validation**: The operation validates both the set name and value according to the specified rules
2. **API Call**: Makes a DELETE request to the 8kit API endpoint `/api/v1/sets/{setName}/values/{value}`
3. **Response Processing**: Handles the API response and formats the result
4. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateSetName(name);
validateValue(value);

// 2. Build endpoint with encoded value
const endpoint = `${buildSetEndpoint(name)}/values/${encodeURIComponent(value)}`;

// 3. Remove value from set
const response = await client.delete(`${baseUrl}${endpoint}`);
```

### Error Scenarios
- **Set Not Found**: When the specified set doesn't exist in the system
- **Value Not Found**: When the specified value doesn't exist in the set
- **Invalid Input**: When the set name or value doesn't meet validation requirements
- **API Errors**: Network issues, authentication problems, or server errors

## Output

### Success Response
```json
{
  "removed": true,
  "value": "user@example.com",
  "result": {
    "id": "val_123456789",
    "setId": "set_987654321",
    "value": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `removed` | boolean | Always `true` for successful removals |
| `value` | string | The value that was removed from the set |
| `result.id` | string | Unique identifier for the removed value |
| `result.setId` | string | ID of the set the value was removed from |
| `result.value` | string | The actual value that was removed |
| `result.createdAt` | string | ISO timestamp when the value was originally created |
| `result.updatedAt` | string | ISO timestamp when the value was last updated |

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "code": "ERROR_CODE"
}
```

## Examples

### Example 1: Basic Value Removal
**Input Parameters:**
- Set Name: `"email_subscribers"`
- Value: `"user@example.com"`

**Expected Output:**
```json
{
  "removed": true,
  "value": "user@example.com",
  "result": {
    "id": "val_123456789",
    "setId": "set_987654321",
    "value": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Example 2: Using Dynamic Input
**Workflow Context:** Previous node provides email addresses to remove

**Input Parameters:**
- Set Name: `"processed_emails"`
- Value: `"{{$json.email}}"` (dynamically from previous node)

**Expected Output:**
```json
{
  "removed": true,
  "value": "john.doe@company.com",
  "result": {
    "id": "val_456789123",
    "setId": "set_123456789",
    "value": "john.doe@company.com",
    "createdAt": "2024-01-15T10:31:00.000Z",
    "updatedAt": "2024-01-15T10:31:00.000Z"
  }
}
```

### Example 3: Error Handling - Set Not Found
**Input Parameters:**
- Set Name: `"nonexistent_set"`
- Value: `"test@example.com"`

**Expected Output:**
```json
{
  "success": false,
  "error": "Set \"nonexistent_set\" not found.",
  "code": "SET_NOT_FOUND"
}
```

### Example 4: Error Handling - Value Not Found
**Input Parameters:**
- Set Name: `"email_subscribers"`
- Value: `"nonexistent@example.com"`

**Expected Output:**
```json
{
  "success": false,
  "error": "Value \"nonexistent@example.com\" not found in set.",
  "code": "VALUE_NOT_FOUND"
}
```

### Example 5: Special Characters in Value
**Input Parameters:**
- Set Name: `"test_set"`
- Value: `"user+test@example.com"`

**Expected Output:**
```json
{
  "removed": true,
  "value": "user+test@example.com",
  "result": {
    "id": "val_999888777",
    "setId": "set_555666777",
    "value": "user+test@example.com",
    "createdAt": "2024-01-15T10:32:00.000Z",
    "updatedAt": "2024-01-15T10:32:00.000Z"
  }
}
``` 