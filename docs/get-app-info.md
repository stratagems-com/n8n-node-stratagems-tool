# Get App Info

Retrieves information about the authenticated app.

## Overview

The **Get App Info** operation allows you to retrieve detailed information about your authenticated application, including its ID, name, description, and timestamps.

## Use Cases

- **App Verification**: Verify that your API credentials are working correctly
- **App Information**: Get details about your app for logging or display purposes
- **Health Monitoring**: Check app status as part of monitoring workflows
- **Debugging**: Troubleshoot authentication issues

## Parameters

This operation does not require any parameters. It uses the API credentials configured in the node.

## Response

### Success Response

```json
{
  "id": "app_123456789",
  "name": "My Application",
  "description": "Production app for user management",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the app |
| `name` | string | Human-readable name of the app |
| `description` | string \| null | Optional description of the app |
| `createdAt` | string | ISO 8601 timestamp when the app was created |
| `updatedAt` | string | ISO 8601 timestamp when the app was last updated |

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Examples

### Basic Usage

1. Configure the 8kit node with your API credentials
2. Select **App** as the resource
3. Select **Get App Info** as the operation
4. Execute the workflow

The node will return your app's information, which you can use in subsequent nodes.

### Integration with Other Nodes

You can use this operation to:
- Verify credentials before making other API calls
- Log app information for audit trails
- Display app details in dashboards
- Check app status in monitoring workflows

## Notes

- This operation requires valid API credentials
- The response includes sensitive information like the app ID
- Use this operation to verify your API connection is working
- The app information is cached and may not reflect real-time changes 