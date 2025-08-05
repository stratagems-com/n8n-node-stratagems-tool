# Remove Mapping from Lookup

## Name
**Remove Mapping from Lookup** - Removes a specific mapping from an existing lookup table in the 8kit system.

## Description
The Remove Mapping from Lookup operation allows you to remove individual key-value mappings from a specified lookup table within the 8kit automation platform. This operation is useful for cleaning up lookup tables, removing outdated mappings, or managing lookup contents dynamically.

### Scenarios
- **Data Cleanup**: Removing outdated or invalid mappings from lookup tables
- **Mapping Management**: Removing incorrect or obsolete ID mappings
- **Lookup Maintenance**: Cleaning up lookup tables by removing unwanted entries
- **Data Correction**: Removing incorrect or duplicate mappings from lookup tables

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the lookup table to remove the mapping from | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |
| `value` | string | Yes | The mapping value to remove from the lookup (can be left or right value) | - Must be a non-empty string<br>- Maximum 255 characters |

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the `value` parameter.

## Operation

### How it Works
1. **Validation**: The operation validates both the lookup name and value according to the specified rules
2. **API Call**: Makes a DELETE request to the 8kit API endpoint `/api/v1/lookups/{lookupName}/values/{value}`
3. **Response Processing**: Handles the API response and formats the result
4. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateLookupName(name);
validateValue(value);

// 2. Build endpoint with encoded value
const endpoint = `${buildLookupEndpoint(name)}/values/${encodeURIComponent(value)}`;

// 3. Remove mapping from lookup
const response = await client.delete(`${baseUrl}${endpoint}`);
```

### Error Scenarios
- **Lookup Not Found**: When the specified lookup doesn't exist in the system
- **Mapping Not Found**: When the specified mapping value doesn't exist in the lookup
- **Invalid Input**: When the lookup name or value doesn't meet validation requirements
- **API Errors**: Network issues, authentication problems, or server errors

## Output

### Success Response
```json
{
  "removed": true,
  "value": "internal_user_123",
  "result": {
    "id": "map_123456789",
    "lookupId": "lookup_987654321",
    "left": "internal_user_123",
    "right": "external_user_456",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `removed` | boolean | Always `true` for successful removals |
| `value` | string | The mapping value that was removed from the lookup |
| `result.id` | string | Unique identifier for the removed mapping |
| `result.lookupId` | string | ID of the lookup table the mapping was removed from |
| `result.left` | string | The left-side value (key) of the removed mapping |
| `result.right` | string | The right-side value (value) of the removed mapping |
| `result.createdAt` | string | ISO timestamp when the mapping was originally created |
| `result.updatedAt` | string | ISO timestamp when the mapping was last updated |

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "code": "ERROR_CODE"
}
```

## Examples

### Example 1: Basic Mapping Removal
**Input Parameters:**
- Lookup Name: `"user_id_mapping"`
- Value: `"internal_user_123"`

**Expected Output:**
```json
{
  "removed": true,
  "value": "internal_user_123",
  "result": {
    "id": "map_123456789",
    "lookupId": "lookup_987654321",
    "left": "internal_user_123",
    "right": "external_user_456",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Example 2: Using Dynamic Input
**Workflow Context:** Previous node provides mapping values to remove

**Input Parameters:**
- Lookup Name: `"product_mapping"`
- Value: `"{{$json.product_id}}"` (dynamically from previous node)

**Expected Output:**
```json
{
  "removed": true,
  "value": "PROD-001",
  "result": {
    "id": "map_456789123",
    "lookupId": "lookup_123456789",
    "left": "PROD-001",
    "right": "SKU-ABC-123",
    "createdAt": "2024-01-15T10:31:00.000Z",
    "updatedAt": "2024-01-15T10:31:00.000Z"
  }
}
```

### Example 3: Error Handling - Lookup Not Found
**Input Parameters:**
- Lookup Name: `"nonexistent_lookup"`
- Value: `"test_mapping"`

**Expected Output:**
```json
{
  "success": false,
  "error": "Lookup \"nonexistent_lookup\" not found.",
  "code": "LOOKUP_NOT_FOUND"
}
```

### Example 4: Error Handling - Mapping Not Found
**Input Parameters:**
- Lookup Name: `"user_id_mapping"`
- Value: `"nonexistent_user"`

**Expected Output:**
```json
{
  "success": false,
  "error": "Mapping \"nonexistent_user\" not found in lookup.",
  "code": "MAPPING_NOT_FOUND"
}
```

### Example 5: Removing by Right Value
**Input Parameters:**
- Lookup Name: `"product_sku_mapping"`
- Value: `"SKU-ABC-123"`

**Expected Output:**
```json
{
  "removed": true,
  "value": "SKU-ABC-123",
  "result": {
    "id": "map_999888777",
    "lookupId": "lookup_555666777",
    "left": "PROD-001",
    "right": "SKU-ABC-123",
    "createdAt": "2024-01-15T10:32:00.000Z",
    "updatedAt": "2024-01-15T10:32:00.000Z"
  }
}
```

### Example 6: Special Characters in Value
**Input Parameters:**
- Lookup Name: `"test_lookup"`
- Value: `"user+test@example.com"`

**Expected Output:**
```json
{
  "removed": true,
  "value": "user+test@example.com",
  "result": {
    "id": "map_777666555",
    "lookupId": "lookup_444333222",
    "left": "user+test@example.com",
    "right": "external_id_123",
    "createdAt": "2024-01-15T10:33:00.000Z",
    "updatedAt": "2024-01-15T10:33:00.000Z"
  }
}
``` 