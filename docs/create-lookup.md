# Create Lookup

## Name
**Create Lookup** - Creates a new lookup table in the 8kit system for mapping between different ID systems.

## Description
The Create Lookup operation allows you to create a new lookup table within the 8kit automation platform. Lookups are containers for storing mappings between different identifier systems, such as internal IDs to external IDs, or any other key-value pairs that need to be tracked and referenced.

### Scenarios
- **ID Mapping**: Creating lookup tables to map between internal and external system IDs
- **Data Integration**: Setting up mappings between different data sources
- **Cross-Reference Tables**: Creating reference tables for data relationships
- **System Integration**: Mapping identifiers between different applications or services

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the lookup table to create | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |
| `description` | string | No | Optional description for the lookup table | - Maximum 255 characters |

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the parameters.

## Operation

### How it Works
1. **Validation**: The operation validates the lookup name according to the specified rules
2. **API Call**: Makes a POST request to the 8kit API endpoint `/api/v1/lookups`
3. **Response Processing**: Handles the API response and formats the result
4. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateLookupName(name);

// 2. Prepare payload
const data = {
    name: name,
    description: description || undefined,
};

// 3. Create lookup via API
const response = await client.post(`${baseUrl}/api/v1/lookups`, data);
```

### Error Scenarios
- **Invalid Lookup Name**: When the lookup name doesn't meet validation requirements
- **Duplicate Lookup Name**: When a lookup with the same name already exists
- **API Errors**: Network issues, authentication problems, or server errors

## Output

### Success Response
```json
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
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the created lookup |
| `name` | string | The name of the lookup table |
| `description` | string | Optional description of the lookup table |
| `leftSystem` | string | Name of the left system (default: "left") |
| `rightSystem` | string | Name of the right system (default: "right") |
| `allowLeftDups` | boolean | Whether the lookup allows duplicate left values |
| `allowRightDups` | boolean | Whether the lookup allows duplicate right values |
| `allowLeftRightDups` | boolean | Whether the lookup allows duplicate left-right pairs |
| `strictChecking` | boolean | Whether strict validation is enabled |
| `createdAt` | string | ISO timestamp when the lookup was created |
| `updatedAt` | string | ISO timestamp when the lookup was last updated |

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "code": "ERROR_CODE"
}
```

## Examples

### Example 1: Basic Lookup Creation
**Input Parameters:**
- Lookup Name: `"user_id_mapping"`
- Description: `"Mapping between internal and external user IDs"`

**Expected Output:**
```json
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
```

### Example 2: Lookup Creation with Dynamic Name
**Workflow Context:** Previous node provides lookup name from a form

**Input Parameters:**
- Lookup Name: `"{{$json.lookupName}}"`
- Description: `"Auto-created lookup for {{$json.lookupName}}"`

**Expected Output:**
```json
{
  "id": "lookup_987654321",
  "name": "product_mapping",
  "description": "Auto-created lookup for product_mapping",
  "leftSystem": "internal",
  "rightSystem": "external",
  "allowLeftDups": false,
  "allowRightDups": false,
  "allowLeftRightDups": false,
  "strictChecking": true,
  "createdAt": "2024-01-15T10:31:00.000Z",
  "updatedAt": "2024-01-15T10:31:00.000Z"
}
```

### Example 3: Error Handling
**Input Parameters:**
- Lookup Name: `"invalid lookup name!"`
- Description: `"Test lookup"`

**Expected Output:**
```json
{
  "success": false,
  "error": "Lookup name can only contain letters, numbers, hyphens, and underscores",
  "code": "VALIDATION_ERROR"
}
```

### Example 4: Duplicate Name Handling
**Input Parameters:**
- Lookup Name: `"existing_lookup"`
- Description: `"Duplicate lookup"`

**Expected Output:**
```json
{
  "success": false,
  "error": "Lookup with name \"existing_lookup\" already exists",
  "code": "DUPLICATE_LOOKUP"
}
``` 