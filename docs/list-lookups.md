# List Lookups

## Name
**List Lookups** - Retrieves all lookup tables available for your application with pagination support.

## Description
The List Lookups operation allows you to retrieve all lookup tables that have been created in your 8kit application. This operation is useful for discovering available lookups, monitoring lookup usage, and managing lookup inventory across your automation workflows.

### Scenarios
- **Lookup Discovery**: Finding all available lookup tables in your application
- **Lookup Management**: Monitoring and auditing lookup usage across workflows
- **Data Inventory**: Keeping track of all mapping tables in your system
- **Workflow Planning**: Understanding what lookups are available for new workflows

## Input

### Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number for pagination | 1 |
| `limit` | number | No | Number of lookups per page | 10 |
| `offset` | number | No | Number of lookups to skip | 0 |

### Advanced Settings
The operation supports pagination through advanced settings:
- **Page**: Specify which page of results to retrieve
- **Limit**: Control how many lookups are returned per page
- **Offset**: Skip a specific number of lookups (alternative to page)

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set pagination parameters.

## Operation

### How it Works
1. **Parameter Processing**: Extracts pagination parameters from advanced settings
2. **Query Building**: Constructs the API query with pagination parameters
3. **API Call**: Makes a GET request to the 8kit API endpoint `/api/v1/lookups`
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
const endpoint = `/api/v1/lookups?${queryParams.toString()}`;
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
  "lookups": [
    {
      "id": "lookup_123456789",
      "name": "user_id_mapping",
      "description": "Mapping between internal and external user IDs",
      "leftSystem": "internal",
      "rightSystem": "external",
      "allowLeftDups": false,
      "allowRightDups": false,
      "allowLeftRightDups": false,
      "strictChecking": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "lookup_987654321",
      "name": "product_mapping",
      "description": "Mapping between product IDs and SKUs",
      "leftSystem": "product_id",
      "rightSystem": "sku",
      "allowLeftDups": false,
      "allowRightDups": false,
      "allowLeftRightDups": false,
      "strictChecking": true,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `lookups` | array | Array of lookup objects |
| `lookups[].id` | string | Unique identifier for the lookup |
| `lookups[].name` | string | The name of the lookup table |
| `lookups[].description` | string | Optional description of the lookup table |
| `lookups[].leftSystem` | string | Name of the left system |
| `lookups[].rightSystem` | string | Name of the right system |
| `lookups[].allowLeftDups` | boolean | Whether the lookup allows duplicate left values |
| `lookups[].allowRightDups` | boolean | Whether the lookup allows duplicate right values |
| `lookups[].allowLeftRightDups` | boolean | Whether the lookup allows duplicate left-right pairs |
| `lookups[].strictChecking` | boolean | Whether strict validation is enabled |
| `lookups[].createdAt` | string | ISO timestamp when the lookup was created |
| `lookups[].updatedAt` | string | ISO timestamp when the lookup was last updated |
| `pagination.page` | number | Current page number |
| `pagination.limit` | number | Number of items per page |
| `pagination.total` | number | Total number of lookups |
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

### Example 1: Basic Lookup Listing
**Input Parameters:**
- Page: `1`
- Limit: `10`
- Offset: `0`

**Expected Output:**
```json
{
  "lookups": [
    {
      "id": "lookup_123456789",
      "name": "user_id_mapping",
      "description": "Mapping between internal and external user IDs",
      "leftSystem": "internal",
      "rightSystem": "external",
      "allowLeftDups": false,
      "allowRightDups": false,
      "allowLeftRightDups": false,
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
  "lookups": [
    {
      "id": "lookup_111111111",
      "name": "lookup_6",
      "description": "Sixth lookup table",
      "leftSystem": "left",
      "rightSystem": "right",
      "allowLeftDups": false,
      "allowRightDups": false,
      "allowLeftRightDups": false,
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
  "lookups": [
    {
      "id": "lookup_222222222",
      "name": "dynamic_lookup",
      "description": "Lookup created dynamically",
      "leftSystem": "left",
      "rightSystem": "right",
      "allowLeftDups": false,
      "allowRightDups": false,
      "allowLeftRightDups": false,
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