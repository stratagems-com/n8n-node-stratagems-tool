# Create Set

## Name
**Create Set** - Creates a new empty set in the 8kit system for tracking unique values.

## Description
The Create Set operation allows you to create a new set within the 8kit automation platform. Sets are containers for storing unique values such as email addresses, user IDs, or any other identifiers that need to be tracked and deduplicated.

### Scenarios
- **Email Marketing**: Creating sets to track email subscribers and prevent duplicate campaigns
- **User Management**: Maintaining lists of users who have performed specific actions
- **Data Processing**: Setting up containers for unique identifiers from various data sources
- **Audit Systems**: Creating sets to track processed items or validated records

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the set to create | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |
| `description` | string | No | Optional description for the set | - Maximum 255 characters |

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the parameters.

## Operation

### How it Works
1. **Validation**: The operation validates the set name according to the specified rules
2. **API Call**: Makes a POST request to the 8kit API endpoint `/api/v1/sets`
3. **Response Processing**: Handles the API response and formats the result
4. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateSetName(name);

// 2. Prepare payload
const data = {
    name: name,
    description: description || undefined,
};

// 3. Create set via API
const response = await client.post(`${baseUrl}/api/v1/sets`, data);
```

### Error Scenarios
- **Invalid Set Name**: When the set name doesn't meet validation requirements
- **Duplicate Set Name**: When a set with the same name already exists
- **API Errors**: Network issues, authentication problems, or server errors

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
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the created set |
| `name` | string | The name of the set |
| `description` | string | Optional description of the set |
| `allowDuplicates` | boolean | Whether the set allows duplicate values (default: false) |
| `strictChecking` | boolean | Whether strict validation is enabled (default: true) |
| `createdAt` | string | ISO timestamp when the set was created |
| `updatedAt` | string | ISO timestamp when the set was last updated |

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "code": "ERROR_CODE"
}
```

## Examples

### Example 1: Basic Set Creation
**Input Parameters:**
- Set Name: `"email_subscribers"`
- Description: `"Set for tracking email subscribers"`

**Expected Output:**
```json
{
  "id": "set_123456789",
  "name": "email_subscribers",
  "description": "Set for tracking email subscribers",
  "allowDuplicates": false,
  "strictChecking": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Example 2: Set Creation with Dynamic Name
**Workflow Context:** Previous node provides set name from a form

**Input Parameters:**
- Set Name: `"{{$json.setName}}"`
- Description: `"Auto-created set for {{$json.setName}}"`

**Expected Output:**
```json
{
  "id": "set_987654321",
  "name": "user_actions",
  "description": "Auto-created set for user_actions",
  "allowDuplicates": false,
  "strictChecking": true,
  "createdAt": "2024-01-15T10:31:00.000Z",
  "updatedAt": "2024-01-15T10:31:00.000Z"
}
```

### Example 3: Error Handling
**Input Parameters:**
- Set Name: `"invalid set name!"`
- Description: `"Test set"`

**Expected Output:**
```json
{
  "success": false,
  "error": "Set name can only contain letters, numbers, hyphens, and underscores",
  "code": "VALIDATION_ERROR"
}
``` 