# Get Lookup Values

## Name
**Get Lookup Values** - Retrieves all mappings stored in a specific lookup table with pagination support.

## Description
The Get Lookup Values operation allows you to retrieve all key-value mappings that have been added to a specific lookup table in the 8kit system. This operation is useful for auditing lookup contents, exporting mapping data, or processing all mappings in a lookup for further analysis.

### Scenarios
- **Data Export**: Retrieving all mappings from a lookup table for backup or analysis purposes
- **Lookup Auditing**: Reviewing the contents of a lookup to verify mapping integrity
- **Data Processing**: Getting all mappings from a lookup for batch processing operations
- **Reporting**: Generating reports based on lookup contents

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the lookup table to retrieve mappings from | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |
| `page` | number | No | Page number for pagination | 1 |
| `limit` | number | No | Number of mappings per page | 10 |
| `offset` | number | No | Number of mappings to skip | 0 |

### Advanced Settings
The operation supports pagination through advanced settings:
- **Page**: Specify which page of results to retrieve
- **Limit**: Control how many mappings are returned per page
- **Offset**: Skip a specific number of mappings (alternative to page)

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the lookup name and pagination parameters.

## Operation

### How it Works
1. **Validation**: The operation validates the lookup name according to the specified rules
2. **Parameter Processing**: Extracts pagination parameters from advanced settings
3. **Query Building**: Constructs the API query with pagination parameters
4. **API Call**: Makes a GET request to the 8kit API endpoint `/api/v1/lookups/{lookupName}/values`
5. **Response Processing**: Handles the API response and formats the result
6. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateLookupName(name);

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
const endpoint = `${buildLookupEndpoint(name)}/values?${queryParams.toString()}`;
const response = await client.get(`${baseUrl}${endpoint}`);
```

### Error Scenarios
- **Lookup Not Found**: When the specified lookup doesn't exist in the system
- **Invalid Lookup Name**: When the lookup name doesn't meet validation requirements
- **Authentication Errors**: Invalid API credentials or missing permissions
- **API Errors**: Network issues, server errors, or rate limiting

## Output

### Success Response
```json
{
  "values": [
    {
      "id": "map_123456789",
      "lookupId": "lookup_987654321",
      "left": "internal_user_123",
      "right": "external_user_456",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "map_987654321",
      "lookupId": "lookup_987654321",
      "left": "internal_user_124",
      "right": "external_user_457",
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
| `values` | array | Array of mapping objects |
| `values[].id` | string | Unique identifier for the mapping |
| `values[].lookupId` | string | ID of the lookup table the mapping belongs to |
| `values[].left` | string | The left-side value (key) of the mapping |
| `values[].right` | string | The right-side value (value) of the mapping |
| `values[].createdAt` | string | ISO timestamp when the mapping was created |
| `values[].updatedAt` | string | ISO timestamp when the mapping was last updated |
| `pagination.page` | number | Current page number |
| `pagination.limit` | number | Number of items per page |
| `pagination.total` | number | Total number of mappings in the lookup |
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

### Example 1: Basic Mapping Retrieval
**Input Parameters:**
- Lookup Name: `"user_id_mapping"`
- Page: `1`
- Limit: `10`
- Offset: `0`

**Expected Output:**
```json
{
  "values": [
    {
      "id": "map_123456789",
      "lookupId": "lookup_987654321",
      "left": "internal_user_123",
      "right": "external_user_456",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "map_987654321",
      "lookupId": "lookup_987654321",
      "left": "internal_user_124",
      "right": "external_user_457",
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
- Lookup Name: `"product_mapping"`
- Page: `2`
- Limit: `5`
- Offset: `0`

**Expected Output:**
```json
{
  "values": [
    {
      "id": "map_111111111",
      "lookupId": "lookup_555666777",
      "left": "prod_006",
      "right": "SKU-FGH-789",
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

### Example 3: Dynamic Lookup Name
**Workflow Context:** Previous node provides lookup name from a form

**Input Parameters:**
- Lookup Name: `"{{$json.lookupName}}"`
- Page: `1`
- Limit: `20`

**Expected Output:**
```json
{
  "values": [
    {
      "id": "map_222222222",
      "lookupId": "lookup_888999000",
      "left": "dynamic_key",
      "right": "dynamic_value",
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
- Lookup Name: `"nonexistent_lookup"`
- Page: `1`
- Limit: `10`

**Expected Output:**
```json
{
  "success": false,
  "error": "Lookup \"nonexistent_lookup\" not found.",
  "code": "LOOKUP_NOT_FOUND"
}
```

### Example 5: Product SKU Mapping
**Input Parameters:**
- Lookup Name: `"product_sku_mapping"`
- Page: `1`
- Limit: `5`

**Expected Output:**
```json
{
  "values": [
    {
      "id": "map_333444555",
      "lookupId": "lookup_777888999",
      "left": "PROD-001",
      "right": "SKU-ABC-123",
      "createdAt": "2024-01-15T10:45:00.000Z",
      "updatedAt": "2024-01-15T10:45:00.000Z"
    },
    {
      "id": "map_666777888",
      "lookupId": "lookup_777888999",
      "left": "PROD-002",
      "right": "SKU-DEF-456",
      "createdAt": "2024-01-15T10:46:00.000Z",
      "updatedAt": "2024-01-15T10:46:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 2,
    "pages": 1
  }
}
``` 