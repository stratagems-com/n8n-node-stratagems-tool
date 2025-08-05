# List Sets

## Name
**List Sets** - Retrieves all sets available for your application with pagination support.

## Description
The List Sets operation allows you to retrieve all sets that have been created in your 8kit application. This operation is useful for discovering available sets, monitoring set usage, and managing set inventory across your automation workflows.

### Scenarios
- **Set Discovery**: Finding all available sets in your application
- **Set Management**: Monitoring and auditing set usage across workflows
- **Data Inventory**: Keeping track of all data containers in your system
- **Workflow Planning**: Understanding what sets are available for new workflows

## Input

### Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number for pagination | 1 |
| `limit` | number | No | Number of sets per page | 10 |
| `offset` | number | No | Number of sets to skip | 0 |

### Advanced Settings
The operation supports pagination through advanced settings:
- **Page**: Specify which page of results to retrieve
- **Limit**: Control how many sets are returned per page
- **Offset**: Skip a specific number of sets (alternative to page)

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set pagination parameters.

## Operation

### How it Works
1. **Parameter Processing**: Extracts pagination parameters from advanced settings
2. **Query Building**: Constructs the API query with pagination parameters
3. **API Call**: Makes a GET request to the 8kit API endpoint `/api/v1/sets`
4. **Response Processing**: Handles the API response and formats the result
5. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Extract pagination parameters
const page = paginationSettings.page || 1;
const limit = paginationSettings.limit || 10;
const offset = paginationSettings.offset || 0;

// 2. Build query parameters
const queryParams = new URLSearchParams();
queryParams.append("page", page.toString());
queryParams.append("limit", limit.toString());
if (offset > 0) {
    queryParams.append("offset", offset.toString());
}

// 3. Make API call
const endpoint = `/api/v1/sets?${queryParams.toString()}`;
const response = await client.get(`${baseUrl}${endpoint}`);
```

### Error Scenarios
- **Authentication Errors**: Invalid API credentials or missing permissions
- **Network Issues**: Connection problems or timeout errors
- **API Errors**: Server-side issues or rate limiting

## Output

### Success Response
```json
{
  "sets": [
    {
      "id": "set_123456789",
      "name": "email_subscribers",
      "description": "Set for tracking email subscribers",
      "allowDuplicates": false,
      "strictChecking": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "set_987654321",
      "name": "user_actions",
      "description": "Set for tracking user actions",
      "allowDuplicates": false,
      "strictChecking": true,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `sets` | array | Array of set objects |
| `sets[].id` | string | Unique identifier for the set |
| `sets[].name` | string | The name of the set |
| `sets[].description` | string | Optional description of the set |
| `sets[].allowDuplicates` | boolean | Whether the set allows duplicate values |
| `sets[].strictChecking` | boolean | Whether strict validation is enabled |
| `sets[].createdAt` | string | ISO timestamp when the set was created |
| `sets[].updatedAt` | string | ISO timestamp when the set was last updated |
| `pagination.page` | number | Current page number |
| `pagination.limit` | number | Number of items per page |
| `pagination.total` | number | Total number of sets |
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

### Example 1: Basic Set Listing
**Input Parameters:**
- Page: `1`
- Limit: `10`
- Offset: `0`

**Expected Output:**
```json
{
  "sets": [
    {
      "id": "set_123456789",
      "name": "email_subscribers",
      "description": "Set for tracking email subscribers",
      "allowDuplicates": false,
      "strictChecking": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Example 2: Paginated Results
**Input Parameters:**
- Page: `2`
- Limit: `5`
- Offset: `0`

**Expected Output:**
```json
{
  "sets": [
    {
      "id": "set_111111111",
      "name": "set_6",
      "description": "Sixth set",
      "allowDuplicates": false,
      "strictChecking": true,
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

### Example 3: Dynamic Pagination
**Workflow Context:** Previous node provides pagination parameters

**Input Parameters:**
- Page: `"{{$json.page}}"`
- Limit: `"{{$json.limit}}"`

**Expected Output:**
```json
{
  "sets": [
    {
      "id": "set_222222222",
      "name": "dynamic_set",
      "description": "Set created dynamically",
      "allowDuplicates": false,
      "strictChecking": true,
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