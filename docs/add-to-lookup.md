# Add Mapping to Lookup

## Name
**Add Mapping to Lookup** - Creates ID mappings between two systems in a lookup table.

## Description
The Add Mapping to Lookup operation allows you to add key-value pairs to a specified lookup table within the 8kit automation platform. This operation is essential for creating mappings between different identifier systems, such as internal IDs to external IDs, or any other cross-reference relationships.

### Scenarios
- **ID Mapping**: Creating mappings between internal and external system identifiers
- **Data Integration**: Mapping data between different systems or databases
- **Cross-Reference Creation**: Building reference tables for data relationships
- **System Integration**: Mapping identifiers between different applications or services

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the lookup table to add the mapping to | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |
| `leftValue` | string | Yes | The left-side value (key) of the mapping | - Must be a non-empty string<br>- Maximum 255 characters |
| `rightValue` | string | Yes | The right-side value (value) of the mapping | - Must be a non-empty string<br>- Maximum 255 characters |

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the mapping values.

## Operation

### How it Works
1. **Validation**: The operation validates the lookup name and both values according to the specified rules
2. **Lookup Existence Check**: Verifies that the target lookup exists in the 8kit system
3. **API Call**: Makes a POST request to the 8kit API endpoint `/api/v1/lookups/{lookupName}/values`
4. **Response Processing**: Handles the API response and formats the result
5. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateLookupName(name);
validateValue(leftValue);
validateValue(rightValue);

// 2. Check if lookup exists
const lookupExists = await checkLookupExists(client, baseUrl, name);
if (!lookupExists) {
    throw new Error(`Lookup "${name}" not found.`);
}

// 3. Add mapping to lookup
const result = await addValueToLookup(client, baseUrl, name, leftValue, rightValue);
```

### Error Scenarios
- **Lookup Not Found**: When the specified lookup doesn't exist in the system
- **Invalid Input**: When the lookup name or values don't meet validation requirements
- **API Errors**: Network issues, authentication problems, or server errors
- **Duplicate Mappings**: The system automatically handles duplicates based on lookup configuration

## Output

### Success Response
```json
{
  "success": true,
  "data": {
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
| `success` | boolean | Always `true` for successful operations |
| `data.id` | string | Unique identifier for the created mapping |
| `data.lookupId` | string | ID of the lookup table the mapping was added to |
| `data.left` | string | The left-side value (key) of the mapping |
| `data.right` | string | The right-side value (value) of the mapping |
| `data.createdAt` | string | ISO timestamp when the mapping was created |
| `data.updatedAt` | string | ISO timestamp when the mapping was last updated |

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "code": "ERROR_CODE"
}
```

## Examples

### Example 1: Basic Mapping Creation
**Input Parameters:**
- Lookup Name: `"user_id_mapping"`
- Left Value: `"internal_user_123"`
- Right Value: `"external_user_456"`

**Expected Output:**
```json
{
  "success": true,
  "data": {
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
**Workflow Context:** Previous node provides mapping data from a CSV file

**Input Parameters:**
- Lookup Name: `"product_mapping"`
- Left Value: `"{{$json.internal_id}}"`
- Right Value: `"{{$json.external_id}}"`

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "id": "map_456789123",
    "lookupId": "lookup_123456789",
    "left": "prod_001",
    "right": "SKU-ABC-123",
    "createdAt": "2024-01-15T10:31:00.000Z",
    "updatedAt": "2024-01-15T10:31:00.000Z"
  }
}
```

### Example 3: Error Handling - Lookup Not Found
**Input Parameters:**
- Lookup Name: `"nonexistent_lookup"`
- Left Value: `"test_key"`
- Right Value: `"test_value"`

**Expected Output:**
```json
{
  "success": false,
  "error": "Lookup \"nonexistent_lookup\" not found.",
  "code": "LOOKUP_NOT_FOUND"
}
```

### Example 4: Product ID to SKU Mapping
**Input Parameters:**
- Lookup Name: `"product_sku_mapping"`
- Left Value: `"PROD-001"`
- Right Value: `"SKU-ABC-123"`

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "id": "map_999888777",
    "lookupId": "lookup_555666777",
    "left": "PROD-001",
    "right": "SKU-ABC-123",
    "createdAt": "2024-01-15T10:32:00.000Z",
    "updatedAt": "2024-01-15T10:32:00.000Z"
  }
}
```

### Example 5: Customer ID Mapping
**Input Parameters:**
- Lookup Name: `"customer_mapping"`
- Left Value: `"CRM_CUST_123"`
- Right Value: `"ERP_CUST_456"`

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "id": "map_777666555",
    "lookupId": "lookup_444333222",
    "left": "CRM_CUST_123",
    "right": "ERP_CUST_456",
    "createdAt": "2024-01-15T10:33:00.000Z",
    "updatedAt": "2024-01-15T10:33:00.000Z"
  }
}
``` 