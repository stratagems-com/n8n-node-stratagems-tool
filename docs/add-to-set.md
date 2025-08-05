# Add Value to Set

## Name
**Add Value to Set** - Adds a new value to an existing set in the 8kit system.

## Description
The Add Value to Set operation allows you to add individual values to a specified set within the 8kit automation platform. This operation is essential for building and maintaining sets of unique identifiers, such as email addresses, user IDs, or any other tracking data.

### Scenarios
- **Email Deduplication**: Adding email addresses to a set to prevent duplicate marketing campaigns
- **User Tracking**: Maintaining lists of users who have performed specific actions
- **Data Collection**: Building sets of unique identifiers from various data sources
- **Audit Trails**: Tracking which items have been processed or validated

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the set to add the value to | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |
| `value` | string | Yes | The value to add to the set | - Must be a non-empty string<br>- Maximum 255 characters |

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the `value` parameter.

## Operation

### How it Works
1. **Validation**: The operation first validates both the set name and value according to the specified rules
2. **Set Existence Check**: Verifies that the target set exists in the 8kit system
3. **API Call**: Makes a POST request to the 8kit API endpoint `/api/v1/sets/{setName}/values`
4. **Response Processing**: Handles the API response and formats the result
5. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateSetName(name);
validateValue(value);

// 2. Check if set exists
const setExists = await checkSetExists(client, baseUrl, name);
if (!setExists) {
    throw new Error(`Set "${name}" not found.`);
}

// 3. Add value to set
const result = await addValueToSet(client, baseUrl, name, value);
```

### Error Scenarios
- **Set Not Found**: When the specified set doesn't exist in the system
- **Invalid Input**: When the set name or value doesn't meet validation requirements
- **API Errors**: Network issues, authentication problems, or server errors
- **Duplicate Values**: The system automatically handles duplicates (no error thrown)

## Output

### Success Response
```json
{
  "success": true,
  "data": {
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
| `success` | boolean | Always `true` for successful operations |
| `data.id` | string | Unique identifier for the added value |
| `data.setId` | string | ID of the set the value was added to |
| `data.value` | string | The actual value that was added |
| `data.createdAt` | string | ISO timestamp when the value was created |
| `data.updatedAt` | string | ISO timestamp when the value was last updated |

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "code": "ERROR_CODE"
}
```

## Examples

### Example 1: Basic Usage
**Input Parameters:**
- Set Name: `"email_subscribers"`
- Value: `"user@example.com"`

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "id": "val_123456789",
    "setId": "set_987654321",
    "value": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Example 2: Using Dynamic Input
**Workflow Context:** Previous node provides email addresses from a CSV file

**Input Parameters:**
- Set Name: `"processed_emails"`
- Value: `"{{$json.email}}"` (dynamically from previous node)

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "id": "val_456789123",
    "setId": "set_123456789",
    "value": "john.doe@company.com",
    "createdAt": "2024-01-15T10:31:00.000Z",
    "updatedAt": "2024-01-15T10:31:00.000Z"
  }
}
```

### Example 3: Error Handling
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

### Example 4: Duplicate Value Handling
**Input Parameters:**
- Set Name: `"email_subscribers"`
- Value: `"existing@example.com"` (value already exists in set)

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "id": "val_999888777",
    "setId": "set_987654321",
    "value": "existing@example.com",
    "createdAt": "2024-01-15T10:32:00.000Z",
    "updatedAt": "2024-01-15T10:32:00.000Z"
  }
}
``` 