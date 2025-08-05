# Get Set Info

## Name
**Get Set Info** - Retrieves detailed information about a specific set including metadata and statistics.

## Description
The Get Set Info operation allows you to retrieve comprehensive information about a specific set in the 8kit system. This operation provides metadata about the set, including its configuration, creation details, and usage statistics.

### Scenarios
- **Set Monitoring**: Checking the status and configuration of specific sets
- **Audit Trails**: Reviewing when sets were created and last modified
- **Configuration Review**: Understanding set settings like duplicate handling and validation rules
- **Debugging**: Investigating set-related issues by examining set properties

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the set to retrieve information for | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the set name parameter.

## Operation

### How it Works
1. **Validation**: The operation validates the set name according to the specified rules
2. **Endpoint Building**: Constructs the API endpoint using the set name
3. **API Call**: Makes a GET request to the 8kit API endpoint `/api/v1/sets/{setName}`
4. **Response Processing**: Handles the API response and formats the result
5. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateSetName(name);

// 2. Build endpoint
const endpoint = buildSetEndpoint(name);

// 3. Make API call
const response = await client.get(`${baseUrl}${endpoint}`);
```

### Error Scenarios
- **Set Not Found**: When the specified set doesn't exist in the system
- **Invalid Set Name**: When the set name doesn't meet validation requirements
- **Authentication Errors**: Invalid API credentials or missing permissions
- **API Errors**: Network issues, server errors, or rate limiting

## Output

### Success Response
```json
{
  "id": "set_123456789",
  "name": "email_subscribers",
  "description": "Set for tracking email subscribers",
  "allowDuplicates": false,
  "strictChecking": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "statistics": {
    "totalValues": 1500,
    "uniqueValues": 1500,
    "duplicateCount": 0
  }
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the set |
| `name` | string | The name of the set |
| `description` | string | Optional description of the set |
| `allowDuplicates` | boolean | Whether the set allows duplicate values |
| `strictChecking` | boolean | Whether strict validation is enabled |
| `createdAt` | string | ISO timestamp when the set was created |
| `updatedAt` | string | ISO timestamp when the set was last updated |
| `statistics.totalValues` | number | Total number of values in the set |
| `statistics.uniqueValues` | number | Number of unique values in the set |
| `statistics.duplicateCount` | number | Number of duplicate values (if duplicates are allowed) |

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "code": "ERROR_CODE"
}
```

## Examples

### Example 1: Basic Set Info Retrieval
**Input Parameters:**
- Set Name: `"email_subscribers"`

**Expected Output:**
```json
{
  "id": "set_123456789",
  "name": "email_subscribers",
  "description": "Set for tracking email subscribers",
  "allowDuplicates": false,
  "strictChecking": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "statistics": {
    "totalValues": 1500,
    "uniqueValues": 1500,
    "duplicateCount": 0
  }
}
```

### Example 2: Dynamic Set Name
**Workflow Context:** Previous node provides set name from a form

**Input Parameters:**
- Set Name: `"{{$json.setName}}"`

**Expected Output:**
```json
{
  "id": "set_987654321",
  "name": "user_actions",
  "description": "Set for tracking user actions",
  "allowDuplicates": false,
  "strictChecking": true,
  "createdAt": "2024-01-15T10:31:00.000Z",
  "updatedAt": "2024-01-15T10:31:00.000Z",
  "statistics": {
    "totalValues": 250,
    "uniqueValues": 250,
    "duplicateCount": 0
  }
}
```

### Example 3: Error Handling
**Input Parameters:**
- Set Name: `"nonexistent_set"`

**Expected Output:**
```json
{
  "success": false,
  "error": "Set \"nonexistent_set\" not found.",
  "code": "SET_NOT_FOUND"
}
```

### Example 4: Set with Duplicates Allowed
**Input Parameters:**
- Set Name: `"duplicate_allowed_set"`

**Expected Output:**
```json
{
  "id": "set_555666777",
  "name": "duplicate_allowed_set",
  "description": "Set that allows duplicate values",
  "allowDuplicates": true,
  "strictChecking": false,
  "createdAt": "2024-01-15T10:32:00.000Z",
  "updatedAt": "2024-01-15T10:32:00.000Z",
  "statistics": {
    "totalValues": 1200,
    "uniqueValues": 1000,
    "duplicateCount": 200
  }
}
``` 