# Get Set Values

## Name
**Get Set Values** - Retrieves all values stored in a specific set with pagination support.

## Description
The Get Set Values operation allows you to retrieve all values that have been added to a specific set in the 8kit system. This operation is useful for auditing set contents, exporting data, or processing all values in a set for further analysis.

### Scenarios
- **Data Export**: Retrieving all values from a set for backup or analysis purposes
- **Set Auditing**: Reviewing the contents of a set to verify data integrity
- **Data Processing**: Getting all values from a set for batch processing operations
- **Reporting**: Generating reports based on set contents

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the set to retrieve values from | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |
| `page` | number | No | Page number for pagination | 1 |
| `limit` | number | No | Number of values per page | 10 |
| `offset` | number | No | Number of values to skip | 0 |

### Advanced Settings
The operation supports pagination through advanced settings:
- **Page**: Specify which page of results to retrieve
- **Limit**: Control how many values are returned per page
- **Offset**: Skip a specific number of values (alternative to page)

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the set name and pagination parameters.

## Operation

### How it Works
1. **Validation**: The operation validates the set name according to the specified rules
2. **Parameter Processing**: Extracts pagination parameters from advanced settings
3. **Query Building**: Constructs the API query with pagination parameters
4. **API Call**: Makes a GET request to the 8kit API endpoint `/api/v1/sets/{setName}/values`
5. **Response Processing**: Handles the API response and formats the result
6. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateSetName(name);

// 2. Extract pagination parameters
const page = paginationSettings.page || 1;
const limit = paginationSettings.limit || 10;
const offset = paginationSettings.offset || 0;

// 3. Build query parameters
const queryParams = new URLSearchParams();
queryParams.append("page", page.toString());
queryParams.append("limit", limit.toString());
if (offset > 0) {
    queryParams.append("offset", offset.toString());
}

// 4. Make API call
const endpoint = `${buildSetEndpoint(name)}/values?${queryParams.toString()}`;
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
  "values": [
    {
      "id": "val_123456789",
      "setId": "set_987654321",
      "value": "user1@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "val_987654321",
      "setId": "set_987654321",
      "value": "user2@example.com",
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1500,
    "pages": 150
  }
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `values` | array | Array of value objects |
| `values[].id` | string | Unique identifier for the value |
| `values[].setId` | string | ID of the set the value belongs to |
| `values[].value` | string | The actual value stored in the set |
| `values[].createdAt` | string | ISO timestamp when the value was created |
| `values[].updatedAt` | string | ISO timestamp when the value was last updated |
| `pagination.page` | number | Current page number |
| `pagination.limit` | number | Number of items per page |
| `pagination.total` | number | Total number of values in the set |
| `pagination.pages` | number | Total number of pages |

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "code": "ERROR_CODE"
}
```

## Examples

### Example 1: Basic Value Retrieval
**Input Parameters:**
- Set Name: `"email_subscribers"`
- Page: `1`
- Limit: `10`
- Offset: `0`

**Expected Output:**
```json
{
  "values": [
    {
      "id": "val_123456789",
      "setId": "set_987654321",
      "value": "user1@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "val_987654321",
      "setId": "set_987654321",
      "value": "user2@example.com",
      "createdAt": "2024-01-15T10:31:00.000Z",
      "updatedAt": "2024-01-15T10:31:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1500,
    "pages": 150
  }
}
```

### Example 2: Paginated Results
**Input Parameters:**
- Set Name: `"user_actions"`
- Page: `2`
- Limit: `5`
- Offset: `0`

**Expected Output:**
```json
{
  "values": [
    {
      "id": "val_111111111",
      "setId": "set_555666777",
      "value": "action_6",
      "createdAt": "2024-01-15T10:35:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 5,
    "total": 6,
    "pages": 2
  }
}
```

### Example 3: Dynamic Set Name
**Workflow Context:** Previous node provides set name from a form

**Input Parameters:**
- Set Name: `"{{$json.setName}}"`
- Page: `1`
- Limit: `20`

**Expected Output:**
```json
{
  "values": [
    {
      "id": "val_222222222",
      "setId": "set_888999000",
      "value": "dynamic_value",
      "createdAt": "2024-01-15T10:40:00.000Z",
      "updatedAt": "2024-01-15T10:40:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### Example 4: Error Handling
**Input Parameters:**
- Set Name: `"nonexistent_set"`
- Page: `1`
- Limit: `10`

**Expected Output:**
```json
{
  "success": false,
  "error": "Set \"nonexistent_set\" not found.",
  "code": "SET_NOT_FOUND"
}
``` 