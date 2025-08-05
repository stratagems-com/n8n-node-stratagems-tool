# Check Set Values

## Name
**Check Set Values** - Checks if a value exists in a set and provides dual output streams for existing and non-existing values.

## Description
The Check Set Values operation allows you to verify whether a specific value exists in a set within the 8kit automation platform. This operation is particularly useful for deduplication, filtering, and conditional processing based on set membership. The operation provides two output streams: one for values that exist in the set and another for values that don't exist.

### Scenarios
- **Email Deduplication**: Checking if email addresses have already been processed to avoid duplicates
- **User Filtering**: Separating new users from existing users in a system
- **Data Validation**: Ensuring data hasn't been processed before
- **Conditional Processing**: Different workflows for existing vs. new data

## Input

### Parameters

| Parameter | Type | Required | Description | Validation Rules |
|-----------|------|----------|-------------|-----------------|
| `name` | string | Yes | The name of the set to check against | - Must be a non-empty string<br>- Can only contain letters, numbers, hyphens, and underscores<br>- Maximum 100 characters |
| `value` | string | Yes | The value to check in the set | - Must be a non-empty string<br>- Maximum 255 characters |
| `getSetValueData` | boolean | No | Whether to include set value data in output | false |
| `setValueDataFieldName` | string | No | Field name for set value data | "__checkData" |

### Advanced Settings
The operation supports advanced settings for enhanced functionality:
- **Get Set Value Data**: When enabled, includes additional data about the set value in the output
- **Set Value Data Field Name**: Custom field name for the set value data (default: "__checkData")

### Input Data
The operation accepts input data from the previous node in the workflow, which can be used to dynamically set the `value` parameter.

## Operation

### How it Works
1. **Validation**: The operation validates both the set name and value according to the specified rules
2. **API Call**: Makes a POST request to the 8kit API endpoint `/api/v1/sets/{setName}/contains`
3. **Response Processing**: Handles the API response and determines output stream
4. **Output Routing**: Routes data to appropriate output stream based on existence
5. **Error Handling**: Provides detailed error messages for various failure scenarios

### Internal Process
```typescript
// 1. Validate inputs
validateSetName(name);
validateValue(value);

// 2. Build endpoint for value check
const endpoint = buildSetEndpoint(name, "contains");

// 3. Check value existence
const response = await client.post(url, { value });

// 4. Determine output stream
const outputIndex = result.exists ? 0 : 1; // 0 = exists, 1 = doesn't exist

// 5. Build output with optional set data
let output = { ...inputData };
if (getSetValueData) {
    output[setValueDataFieldName] = result.value;
}
```

### Error Scenarios
- **Set Not Found**: When the specified set doesn't exist in the system
- **Invalid Input**: When the set name or value doesn't meet validation requirements
- **API Errors**: Network issues, authentication problems, or server errors

## Output

### Dual Output Streams
The operation provides two output streams:
- **Output 0**: Values that exist in the set
- **Output 1**: Values that don't exist in the set

### Success Response - Value Exists (Output 0)
```json
{
  "value": "user@example.com",
  "exists": true,
  "__checkData": {
    "id": "val_123456789",
    "setId": "set_987654321",
    "value": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Success Response - Value Doesn't Exist (Output 1)
```json
{
  "value": "newuser@example.com",
  "exists": false
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `value` | string | The value that was checked |
| `exists` | boolean | Whether the value exists in the set |
| `__checkData` | object | Set value data (only when `getSetValueData` is true) |
| `__checkData.id` | string | Unique identifier for the set value |
| `__checkData.setId` | string | ID of the set |
| `__checkData.value` | string | The actual value in the set |
| `__checkData.createdAt` | string | ISO timestamp when the value was created |
| `__checkData.updatedAt` | string | ISO timestamp when the value was last updated |

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue",
  "code": "ERROR_CODE"
}
```

## Examples

### Example 1: Basic Value Check
**Input Parameters:**
- Set Name: `"email_subscribers"`
- Value: `"user@example.com"`
- Get Set Value Data: `false`

**Expected Output (if value exists):**
```json
{
  "value": "user@example.com",
  "exists": true
}
```

**Expected Output (if value doesn't exist):**
```json
{
  "value": "user@example.com",
  "exists": false
}
```

### Example 2: With Set Value Data
**Input Parameters:**
- Set Name: `"email_subscribers"`
- Value: `"user@example.com"`
- Get Set Value Data: `true`
- Set Value Data Field Name: `"setData"`

**Expected Output (if value exists):**
```json
{
  "value": "user@example.com",
  "exists": true,
  "setData": {
    "id": "val_123456789",
    "setId": "set_987654321",
    "value": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Example 3: Dynamic Value Check
**Workflow Context:** Previous node provides email addresses from a form

**Input Parameters:**
- Set Name: `"processed_emails"`
- Value: `"{{$json.email}}"` (dynamically from previous node)
- Get Set Value Data: `true`

**Expected Output (if value exists):**
```json
{
  "value": "john.doe@company.com",
  "exists": true,
  "__checkData": {
    "id": "val_456789123",
    "setId": "set_123456789",
    "value": "john.doe@company.com",
    "createdAt": "2024-01-15T10:31:00.000Z",
    "updatedAt": "2024-01-15T10:31:00.000Z"
  }
}
```

### Example 4: Error Handling
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

### Example 5: Workflow Integration
**Scenario:** Email deduplication workflow

**Input Parameters:**
- Set Name: `"sent_emails"`
- Value: `"{{$json.email}}"`

**Workflow Logic:**
- **Output 0 (exists)**: Email already sent, skip processing
- **Output 1 (doesn't exist)**: New email, proceed with sending and add to set 