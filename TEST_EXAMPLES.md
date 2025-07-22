# Stratagems Tool - Check Set Values Test Examples

## Overview
The `checkSetValues` operation supports both single and bulk modes for checking if values exist in a set.

## Single Mode Examples

### Example 1: Basic Single Value Check
**Input:**
```json
{
  "orderId": "ORD-12345"
}
```

**Node Configuration:**
- Operation: `checkSetValues`
- Mode: `single`
- Set Name: `processed-orders`
- Value Field: `orderId`
- Output Field: `exists`
- Filter Mode: `all`
- Auto Create Set/Lookup: `false`

**Output:**
```json
{
  "orderId": "ORD-12345",
  "exists": true,
  "checkedValue": "ORD-12345",
  "operation": "checkSetValues",
  "mode": "single",
  "filterMode": "all",
  "setValue": {
    "id": "123",
    "value": "ORD-12345",
    "setId": "456",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Example 2: Filter Existing Only
**Input:**
```json
{
  "orderId": "ORD-12345"
}
```

**Node Configuration:**
- Filter Mode: `existing`

**Output:** (only if value exists in set)
```json
{
  "orderId": "ORD-12345",
  "exists": true,
  "checkedValue": "ORD-12345",
  "operation": "checkSetValues",
  "mode": "single",
  "filterMode": "existing"
}
```

**Output:** (if value doesn't exist - item is skipped)
```json
null
```

### Example 3: Filter Non-Existing Only
**Input:**
```json
{
  "orderId": "ORD-99999"
}
```

**Node Configuration:**
- Filter Mode: `nonExisting`

**Output:** (only if value doesn't exist in set)
```json
{
  "orderId": "ORD-99999",
  "exists": false,
  "checkedValue": "ORD-99999",
  "operation": "checkSetValues",
  "mode": "single",
  "filterMode": "nonExisting",
  "setValue": null
}
```

## Bulk Mode Examples

### Example 4: Basic Bulk Check with Array
**Input:**
```json
{
  "orderIds": ["ORD-12345", "ORD-67890", "ORD-11111"]
}
```

**Node Configuration:**
- Operation: `checkSetValues`
- Mode: `bulk`
- Set Name: `processed-orders`
- Value Field: `orderIds`
- Output Field: `exists`
- Filter Mode: `all`
- Auto Create Set/Lookup: `false`

**Output:**
```json
{
  "orderIds": ["ORD-12345", "ORD-67890", "ORD-11111"],
  "exists": [true, false, true],
  "checkedValues": ["ORD-12345", "ORD-67890", "ORD-11111"],
  "operation": "checkSetValues",
  "mode": "bulk",
  "filterMode": "all",
  "totalChecked": 3,
  "found": 2,
  "notFound": 1,
  "errors": [],
  "checks": [
    { "value": "ORD-12345", "exists": true, "setValue": {...} },
    { "value": "ORD-67890", "exists": false },
    { "value": "ORD-11111", "exists": true, "setValue": {...} }
  ],
  "allChecks": [
    { "value": "ORD-12345", "exists": true, "setValue": {...} },
    { "value": "ORD-67890", "exists": false },
    { "value": "ORD-11111", "exists": true, "setValue": {...} }
  ]
}
```

### Example 5: Bulk Check with Comma-Separated String
**Input:**
```json
{
  "orderIds": "ORD-12345,ORD-67890,ORD-11111"
}
```

**Node Configuration:**
- Mode: `bulk`
- Value Field: `orderIds`

**Output:** (same as Example 4)

### Example 6: Filter Existing Only in Bulk
**Input:**
```json
{
  "orderIds": ["ORD-12345", "ORD-67890", "ORD-11111"]
}
```

**Node Configuration:**
- Filter Mode: `existing`

**Output:**
```json
{
  "orderIds": ["ORD-12345", "ORD-67890", "ORD-11111"],
  "exists": [true, true],
  "checkedValues": ["ORD-12345", "ORD-11111"],
  "operation": "checkSetValues",
  "mode": "bulk",
  "filterMode": "existing",
  "totalChecked": 3,
  "found": 2,
  "notFound": 1,
  "errors": [],
  "checks": [
    { "value": "ORD-12345", "exists": true, "setValue": {...} },
    { "value": "ORD-11111", "exists": true, "setValue": {...} }
  ],
  "allChecks": [
    { "value": "ORD-12345", "exists": true, "setValue": {...} },
    { "value": "ORD-67890", "exists": false },
    { "value": "ORD-11111", "exists": true, "setValue": {...} }
  ]
}
```

### Example 7: Filter Non-Existing Only in Bulk
**Input:**
```json
{
  "orderIds": ["ORD-12345", "ORD-67890", "ORD-11111"]
}
```

**Node Configuration:**
- Filter Mode: `nonExisting`

**Output:**
```json
{
  "orderIds": ["ORD-12345", "ORD-67890", "ORD-11111"],
  "exists": [false],
  "checkedValues": ["ORD-67890"],
  "operation": "checkSetValues",
  "mode": "bulk",
  "filterMode": "nonExisting",
  "totalChecked": 3,
  "found": 2,
  "notFound": 1,
  "errors": [],
  "checks": [
    { "value": "ORD-67890", "exists": false }
  ],
  "allChecks": [
    { "value": "ORD-12345", "exists": true, "setValue": {...} },
    { "value": "ORD-67890", "exists": false },
    { "value": "ORD-11111", "exists": true, "setValue": {...} }
  ]
}
```

## Auto-Create Examples

### Example 8: Auto-Create Set (Single Mode)
**Input:**
```json
{
  "orderId": "ORD-12345"
}
```

**Node Configuration:**
- Auto Create Set/Lookup: `true`

**Output:** (if set doesn't exist)
```json
{
  "orderId": "ORD-12345",
  "exists": false,
  "checkedValue": "ORD-12345",
  "operation": "checkSetValues",
  "mode": "single",
  "filterMode": "all",
  "setValue": null,
  "note": "Set created automatically"
}
```

### Example 9: Auto-Create Set (Bulk Mode)
**Input:**
```json
{
  "orderIds": ["ORD-12345", "ORD-67890"]
}
```

**Node Configuration:**
- Auto Create Set/Lookup: `true`

**Output:** (if set doesn't exist)
```json
{
  "orderIds": ["ORD-12345", "ORD-67890"],
  "exists": [false, false],
  "checkedValues": ["ORD-12345", "ORD-67890"],
  "operation": "checkSetValues",
  "mode": "bulk",
  "filterMode": "all",
  "totalChecked": 2,
  "found": 0,
  "notFound": 2,
  "errors": [],
  "checks": [
    { "value": "ORD-12345", "exists": false },
    { "value": "ORD-67890", "exists": false }
  ],
  "allChecks": [
    { "value": "ORD-12345", "exists": false },
    { "value": "ORD-67890", "exists": false }
  ],
  "note": "Set created automatically"
}
```

## Error Handling Examples

### Example 10: Invalid Value Field
**Input:**
```json
{
  "data": "some data"
}
```

**Node Configuration:**
- Value Field: `orderId` (doesn't exist in input)

**Error:**
```
Value field "orderId" is required and cannot be empty
```

### Example 11: Invalid Set Name
**Input:**
```json
{
  "orderId": "ORD-12345"
}
```

**Node Configuration:**
- Set Name: `invalid@set#name`

**Error:**
```
Set name can only contain letters, numbers, hyphens, and underscores
```

### Example 12: Set Not Found (Auto-Create Disabled)
**Input:**
```json
{
  "orderId": "ORD-12345"
}
```

**Node Configuration:**
- Set Name: `non-existent-set`
- Auto Create Set/Lookup: `false`

**Error:**
```
Set "non-existent-set" not found. Enable "Auto Create Set/Lookup" to create it automatically.
```

## Workflow Integration Examples

### Example 13: Process Only New Orders
1. **Set** node: Create input data
2. **Stratagems Tool** node: Check if orders exist in `processed-orders` set
   - Filter Mode: `nonExisting`
3. **Process** node: Process only new orders
4. **Stratagems Tool** node: Add processed orders to `processed-orders` set

### Example 14: Batch Processing with Deduplication
1. **Set** node: Create batch of order IDs
2. **Stratagems Tool** node: Check which orders are already processed
   - Mode: `bulk`
   - Filter Mode: `nonExisting`
3. **Process** node: Process only unprocessed orders
4. **Stratagems Tool** node: Add processed orders to set

### Example 15: Data Validation
1. **Set** node: Create data with IDs
2. **Stratagems Tool** node: Check if IDs exist in `valid-ids` set
   - Filter Mode: `existing`
3. **Process** node: Process only valid IDs 