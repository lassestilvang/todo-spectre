# Todo Spectre - API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Tasks API](#tasks-api)
3. [Lists API](#lists-api)
4. [Views API](#views-api)
5. [Search API](#search-api)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Pagination](#pagination)

## Authentication

All API endpoints require authentication using JWT tokens.

### Authentication Flow
1. **Login**: `POST /api/auth/login` - Get JWT token
2. **Include Token**: Add `Authorization: Bearer <token>` header to requests
3. **Refresh**: `POST /api/auth/refresh` - Refresh expired tokens

### Example Request
```javascript
// Login request
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure-password'
  })
});

const { token } = await response.json();

// Authenticated request
const tasks = await fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Tasks API

### `GET /api/tasks` - Get All Tasks

**Parameters:**
- `status` (string): Filter by status (pending, completed, etc.)
- `priority` (number): Filter by priority (0-3)
- `list_id` (number): Filter by list ID

**Response:**
```json
[
  {
    "id": 1,
    "list_id": 1,
    "title": "Complete project",
    "description": "Finish the todo app",
    "due_date": "2025-12-15T00:00:00.000Z",
    "priority": 2,
    "status": "pending",
    "created_at": "2025-12-01T10:00:00.000Z",
    "updated_at": "2025-12-01T10:00:00.000Z",
    "task_logs": [],
    "task_labels": [],
    "task_attachments": []
  }
]
```

### `POST /api/tasks` - Create Task

**Request Body:**
```json
{
  "list_id": 1,
  "title": "New task",
  "description": "Task description",
  "due_date": "2025-12-15",
  "priority": 1,
  "status": "pending"
}
```

**Response:**
```json
{
  "id": 1,
  "list_id": 1,
  "title": "New task",
  "description": "Task description",
  "due_date": "2025-12-15T00:00:00.000Z",
  "priority": 1,
  "status": "pending",
  "created_at": "2025-12-01T10:00:00.000Z",
  "updated_at": "2025-12-01T10:00:00.000Z"
}
```

### `PUT /api/tasks/:id` - Update Task

**Request Body:**
```json
{
  "title": "Updated task",
  "description": "Updated description",
  "status": "completed"
}
```

**Response:**
```json
{
  "id": 1,
  "list_id": 1,
  "title": "Updated task",
  "description": "Updated description",
  "status": "completed",
  "updated_at": "2025-12-01T11:00:00.000Z"
}
```

### `DELETE /api/tasks/:id` - Delete Task

**Response:**
```json
{
  "success": true
}
```

## Lists API

### `GET /api/lists` - Get All Lists

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Work",
    "color": "#ff0000",
    "icon": "briefcase",
    "created_at": "2025-12-01T10:00:00.000Z",
    "updated_at": "2025-12-01T10:00:00.000Z"
  }
]
```

### `POST /api/lists` - Create List

**Request Body:**
```json
{
  "title": "Personal",
  "color": "#00ff00",
  "icon": "home"
}
```

**Response:**
```json
{
  "id": 2,
  "user_id": 1,
  "title": "Personal",
  "color": "#00ff00",
  "icon": "home",
  "created_at": "2025-12-01T10:00:00.000Z",
  "updated_at": "2025-12-01T10:00:00.000Z"
}
```

### `PUT /api/lists/:id` - Update List

**Request Body:**
```json
{
  "title": "Updated List",
  "color": "#0000ff"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Updated List",
  "color": "#0000ff",
  "updated_at": "2025-12-01T11:00:00.000Z"
}
```

### `DELETE /api/lists/:id` - Delete List

**Response:**
```json
{
  "success": true
}
```

## Views API

### `GET /api/views` - Get All Views

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Today",
    "type": "day",
    "filter_criteria": "{\"status\":\"pending\"}",
    "sort_order": "{\"field\":\"due_date\",\"direction\":\"asc\"}",
    "created_at": "2025-12-01T10:00:00.000Z",
    "updated_at": "2025-12-01T10:00:00.000Z"
  }
]
```

### `POST /api/views` - Create View

**Request Body:**
```json
{
  "name": "Upcoming",
  "type": "week",
  "filter_criteria": "{\"status\":\"pending\"}",
  "sort_order": "{\"field\":\"due_date\",\"direction\":\"asc\"}"
}
```

**Response:**
```json
{
  "id": 2,
  "user_id": 1,
  "name": "Upcoming",
  "type": "week",
  "created_at": "2025-12-01T10:00:00.000Z",
  "updated_at": "2025-12-01T10:00:00.000Z"
}
```

## Search API

### `GET /api/search` - Search Tasks and Lists

**Parameters:**
- `query` (string): Search query
- `type` (string): Search type (tasks, lists, all)

**Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the todo app",
      "status": "pending"
    }
  ],
  "lists": [
    {
      "id": 1,
      "title": "Work",
      "color": "#ff0000"
    }
  ]
}
```

## Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details",
  "status": 400
}
```

### Common Error Codes

| Status | Error Type | Description |
|--------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Input validation failed |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 500 | `INTERNAL_ERROR` | Server error |

## Rate Limiting

API endpoints have rate limiting to prevent abuse:

- **Authenticated Users**: 100 requests per minute
- **Unauthenticated Users**: 10 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Total allowed requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## Pagination

For endpoints that return multiple items, pagination is supported:

**Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Response Headers:**
- `X-Total-Count`: Total number of items
- `X-Page`: Current page
- `X-Per-Page`: Items per page
- `X-Total-Pages`: Total pages

## Webhook Events

The API supports webhook notifications for important events:

### Task Events
- `task.created`
- `task.updated`
- `task.deleted`
- `task.completed`

### List Events
- `list.created`
- `list.updated`
- `list.deleted`

## API Versioning

The API uses semantic versioning:

- **Current Version**: v1
- **Base Path**: `/api/v1/` (planned for future versions)
- **Deprecation Policy**: 6 months notice for breaking changes

## Authentication Tokens

### Token Types
1. **Access Token**: Short-lived (1 hour), used for API requests
2. **Refresh Token**: Long-lived (30 days), used to get new access tokens

### Token Storage
- **Client-side**: Store in memory or secure cookie
- **Server-side**: Store in HTTP-only, secure cookies

## Best Practices

1. **Caching**: Cache responses with proper cache headers
2. **Error Handling**: Always handle API errors gracefully
3. **Pagination**: Use pagination for large datasets
4. **Rate Limiting**: Respect rate limits and implement retries
5. **Security**: Never expose tokens in client-side code

## API Clients

Example API client implementations:

### JavaScript Client
```javascript
class TodoApiClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async getTasks() {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }
}
```

### TypeScript Client
```typescript
interface Task {
  id: number;
  title: string;
  status: string;
}

class TodoApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }
}
```

## API Testing

Use the provided test endpoints for API testing:

- `GET /api/debug/tasks` - Debug task endpoint
- `GET /api/debug/lists` - Debug list endpoint

## API Documentation Tools

The API is documented using:
- **OpenAPI/Swagger**: For interactive documentation
- **TypeScript Types**: For type-safe clients
- **Markdown**: For human-readable documentation

## Future API Enhancements

Planned API features:
- WebSocket support for real-time updates
- GraphQL endpoint for complex queries
- API versioning with `/api/v2/` endpoints
- Enhanced filtering and sorting options