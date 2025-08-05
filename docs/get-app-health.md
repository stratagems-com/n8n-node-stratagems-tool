# Get App Health

Checks the health status of the authenticated app.

## Overview

The **Get App Health** operation allows you to check the health status of your authenticated application, providing a simple way to verify that your app is operational and responding to requests.

## Use Cases

- **Health Monitoring**: Check app status in monitoring workflows
- **Uptime Monitoring**: Verify app availability for uptime checks
- **Alert Systems**: Trigger alerts when app health is compromised
- **Load Balancing**: Check app health before routing traffic
- **Debugging**: Troubleshoot connectivity issues

## Parameters

This operation does not require any parameters. It uses the API credentials configured in the node.

## Response

### Success Response

```json
{
  "appId": "app_123456789",
  "appName": "My Application",
  "status": "healthy",
  "timestamp": "2024-01-20T14:45:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `appId` | string | Unique identifier for the app |
| `appName` | string | Human-readable name of the app |
| `status` | string | Health status (typically "healthy") |
| `timestamp` | string | ISO 8601 timestamp of the health check |

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
3. Select **Health Check** as the operation
4. Execute the workflow

The node will return the health status of your app.

### Integration with Monitoring

You can use this operation in monitoring workflows:

1. **Scheduled Health Checks**: Run this operation every few minutes to monitor app health
2. **Alert Integration**: Use the response to trigger alerts if status is not "healthy"
3. **Dashboard Integration**: Display health status in monitoring dashboards
4. **Load Balancer Integration**: Use health checks to determine if traffic should be routed to this app

### Conditional Workflows

```javascript
// Example: Only proceed if app is healthy
if (healthStatus.status === "healthy") {
  // Continue with workflow
} else {
  // Send alert or take corrective action
}
```

## Notes

- This operation requires valid API credentials
- The health check is lightweight and designed for frequent use
- Use this operation as part of comprehensive monitoring strategies
- The status field may be extended in future versions to include more detailed health information 