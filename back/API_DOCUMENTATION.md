# API Documentation

Complete list of all API endpoints in the Task Manager application.

---

## Authentication Endpoints

### POST `/auth/signup`
Create a new user account and send verification code.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Verification code sent",
  "email": "user@example.com"
}
```

**Status Codes:**
- `201` - Success
- `400` - Validation error
- `409` - Email already exists

---

### POST `/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Logged in successfully"
}
```
**Note:** JWT token is set in HttpOnly cookie.

**Status Codes:**
- `201` - Success
- `400` - Validation error
- `401` - Invalid credentials / Email not verified / Account locked
- `403` - IP not in allow-list

**IP Restrictions:** Login is checked against the IP allow-list.

**Lockout:** After 3 failed attempts, account is locked for 2 minutes.

---

### POST `/auth/verify`
Verify email with 6-digit code.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Email verified successfully. Please log in."
}
```

**Status Codes:**
- `201` - Success
- `400` - Invalid/expired code / Too many failed attempts (max 5)

**Expiry:** Codes expire after 1 minute.

**Attempts:** Blocked after 5 failed attempts. Use `/auth/resend` to reset counter.

---

### POST `/auth/resend`
Resend verification code.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification code resent",
  "email": "user@example.com"
}
```

**Status Codes:**
- `201` - Success
- `400` - User not found / Already verified

**Note:** Resets failed verification attempt counter.

---

### GET `/auth/me`
Get current authenticated user info.

**Headers:**
```
Cookie: token=JWT_TOKEN
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "isAdmin": false,
  "verified": true,
  "createdAt": "2025-11-03T10:00:00.000Z",
  "updatedAt": "2025-11-03T10:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated

---

### POST `/auth/logout`
Logout and clear session cookie.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `201` - Success

---

## User Endpoints

### GET `/users/me`
Get current user details with tasks.

**Authentication:** Required (JWT in cookie)

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "verified": true,
  "isAdmin": false,
  "createdAt": "2025-11-03T10:00:00.000Z",
  "updatedAt": "2025-11-03T10:00:00.000Z",
  "tasks": [...]
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated

---

### PATCH `/users/me`
Update current user profile.

**Authentication:** Required

**Request:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "name": "New Name",
  ...
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Not authenticated

---

### DELETE `/users/me`
Delete current user account.

**Authentication:** Required

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  ...
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated

**Note:** Cascades and deletes all user's tasks.

---

## Task Endpoints

### GET `/tasks`
Get all tasks for the authenticated user.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": 1,
    "title": "Complete project",
    "description": "Finish the task manager",
    "completed": false,
    "userId": 1,
    "createdAt": "2025-11-03T10:00:00.000Z",
    "updatedAt": "2025-11-03T10:00:00.000Z",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated

**Note:** Tasks are ordered by newest first (createdAt DESC).

---

### GET `/tasks/:id`
Get a specific task by ID.

**Authentication:** Required

**Response:**
```json
{
  "id": 1,
  "title": "Complete project",
  "description": "Finish the task manager",
  "completed": false,
  "userId": 1,
  "createdAt": "2025-11-03T10:00:00.000Z",
  "updatedAt": "2025-11-03T10:00:00.000Z",
  "user": { ... }
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - Task not found

---

### POST `/tasks`
Create a new task.

**Authentication:** Required

**Request:**
```json
{
  "title": "New task",
  "description": "Optional description",
  "completed": false
}
```

**Response:**
```json
{
  "id": 2,
  "title": "New task",
  "description": "Optional description",
  "completed": false,
  "userId": 1,
  "createdAt": "2025-11-03T11:00:00.000Z",
  "updatedAt": "2025-11-03T11:00:00.000Z",
  "user": { ... }
}
```

**Status Codes:**
- `201` - Success
- `400` - Validation error
- `401` - Not authenticated

**Validation:**
- `title` - Required, string
- `description` - Optional, string
- `completed` - Optional, boolean

**Note:** `userId` is automatically set from the authenticated user's JWT.

---

### PATCH `/tasks/:id`
Update an existing task.

**Authentication:** Required

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "userId": 1,
  "createdAt": "2025-11-03T10:00:00.000Z",
  "updatedAt": "2025-11-03T11:30:00.000Z",
  "user": { ... }
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Not authenticated
- `404` - Task not found

**Validation:** All fields are optional.

---

### DELETE `/tasks/:id`
Delete a task.

**Authentication:** Required

**Response:**
```json
{
  "id": 1,
  "title": "Deleted task",
  ...
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - Task not found

---

## Admin Endpoints (IP Allow-List)

**Authentication:** Required (JWT + Admin role)

### GET `/ip-allowlist`
Get all IP addresses in the allow-list.

**Response:**
```json
[
  {
    "id": 1,
    "ip": "127.0.0.1",
    "label": "Localhost",
    "isActive": true,
    "createdAt": "2025-11-03T10:00:00.000Z",
    "updatedAt": "2025-11-03T10:00:00.000Z"
  },
  {
    "id": 2,
    "ip": "::1",
    "label": "IPv6 Localhost",
    "isActive": true,
    "createdAt": "2025-11-03T10:05:00.000Z",
    "updatedAt": "2025-11-03T10:05:00.000Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `403` - Not an admin

---

### POST `/ip-allowlist`
Add a new IP to the allow-list.

**Request:**
```json
{
  "ip": "192.168.1.100",
  "label": "Office Network"
}
```

**Response:**
```json
{
  "id": 3,
  "ip": "192.168.1.100",
  "label": "Office Network",
  "isActive": true,
  "createdAt": "2025-11-03T11:00:00.000Z",
  "updatedAt": "2025-11-03T11:00:00.000Z"
}
```

**Status Codes:**
- `201` - Success
- `400` - Validation error / IP already exists
- `401` - Not authenticated
- `403` - Not an admin

---

### DELETE `/ip-allowlist/:ip`
Deactivate an IP (soft delete).

**URL Parameters:**
- `ip` - The IP address to deactivate (e.g., `127.0.0.1`)

**Response:**
```json
{
  "id": 1,
  "ip": "127.0.0.1",
  "label": "Localhost",
  "isActive": false,
  "createdAt": "2025-11-03T10:00:00.000Z",
  "updatedAt": "2025-11-03T11:30:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `403` - Not an admin
- `404` - IP not found

**Note:** This is a soft delete. The IP remains in the database but is marked as inactive.

---

### POST `/ip-allowlist/:ip/activate`
Reactivate a previously deactivated IP.

**URL Parameters:**
- `ip` - The IP address to activate

**Response:**
```json
{
  "id": 1,
  "ip": "127.0.0.1",
  "label": "Localhost",
  "isActive": true,
  "createdAt": "2025-11-03T10:00:00.000Z",
  "updatedAt": "2025-11-03T11:45:00.000Z"
}
```

**Status Codes:**
- `201` - Success
- `401` - Not authenticated
- `403` - Not an admin
- `404` - IP not found

---

## Authentication & Authorization

### Authentication Methods

1. **HttpOnly Cookies** (Primary)
   - Token stored in secure cookie
   - Automatically sent with requests using `withCredentials: true`
   - Protected from XSS attacks

2. **Bearer Token** (Fallback)
   - Can also send JWT in `Authorization: Bearer TOKEN` header
   - Useful for API clients, mobile apps, etc.

### Authorization Levels

1. **Public** - No authentication required
   - `POST /auth/signup`
   - `POST /auth/login`
   - `POST /auth/verify`
   - `POST /auth/resend`

2. **Authenticated** - Requires valid JWT
   - `GET /auth/me`
   - `POST /auth/logout`
   - `GET /users/me`
   - `PATCH /users/me`
   - `DELETE /users/me`
   - All `/tasks/*` endpoints

3. **Admin Only** - Requires JWT + `isAdmin = true`
   - All `/ip-allowlist/*` endpoints

---

## Common Response Codes

- `200` - OK (successful GET/PATCH/DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error, missing fields)
- `401` - Unauthorized (not authenticated, invalid credentials)
- `403` - Forbidden (IP blocked, admin access required)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

---

## Rate Limiting

Currently not implemented. Consider adding for production:
- Login: 5 attempts per minute per IP
- Signup: 3 attempts per hour per IP
- Verification: Handled by database (5 attempts max, 1-minute expiry)

---

## Security Features

### Login Protection
- **IP Allow-List**: Only allowed IPs can login
- **Account Lockout**: 3 failed attempts → 2 minute lock
- **Denied Attempts Log**: All blocked login attempts logged to `ip-denied-attempts.log`

### Verification Protection
- **Code Expiry**: 1 minute after creation
- **Attempt Limit**: 5 failed attempts then blocked
- **Code Hashing**: Verification codes stored hashed in database
- **Resend Reset**: Counter resets when new code is requested

### Session Security
- **HttpOnly Cookies**: Protects against XSS
- **SameSite**: Set to `lax` to prevent CSRF
- **Secure Flag**: Enabled in production
- **7-Day Expiry**: Sessions expire after 7 days

---

## Base URL

**Development:**
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

**Production:**
- Update CORS origin in `back/src/main.ts`
- Set `NODE_ENV=production` for secure cookies
- Use HTTPS

---

## CORS Configuration

```typescript
origin: 'http://localhost:3000',
credentials: true
```

Frontend must send requests with `withCredentials: true` (already configured in `front/src/services/api.ts`).

---

## Error Response Format

All errors follow this structure:

```json
{
  "statusCode": 400,
  "message": "Email is required",
  "error": "Bad Request"
}
```

Or for validation errors:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be at least 6 characters"
  ],
  "error": "Bad Request"
}
```

---

## Testing APIs

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"pass123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}' \
  -c cookies.txt
```

**Get Tasks (with cookie):**
```bash
curl http://localhost:3001/tasks \
  -b cookies.txt
```

**Create Task:**
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"My Task","description":"Task details"}'
```

### Using Postman/Thunder Client

1. Set base URL: `http://localhost:3001`
2. Enable "Send cookies" in settings
3. After login, cookie is automatically stored and sent
4. Use for all subsequent requests

---

## Logs and Monitoring

### Verification Codes
- Location: `back/mailbox.log`
- Format: `[timestamp] Email: user@example.com | Name: John | Verification Code: 123456`

### IP Denied Attempts
- Location: `back/ip-denied-attempts.log`
- Format: `[timestamp] DENIED - IP: 127.0.0.1 | Email: user@example.com | UserAgent: ...`

---

## Database Models

See `back/prisma/schema.prisma` for complete schema.

### Key Models
- **User** - Users with auth and admin fields
- **Task** - User tasks
- **VerificationCode** - Email verification codes (1-min expiry)
- **IpAllowList** - Allowed IP addresses for login

---

## Examples

### Complete User Flow

```bash
# 1. Signup
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","name":"John","password":"secret123"}'

# 2. Check mailbox.log for verification code
cat back/mailbox.log

# 3. Verify email
curl -X POST http://localhost:3001/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","code":"123456"}'

# 4. Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}' \
  -c cookies.txt

# 5. Create task
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}'

# 6. Get tasks
curl http://localhost:3001/tasks -b cookies.txt

# 7. Update task
curl -X PATCH http://localhost:3001/tasks/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"completed":true}'

# 8. Logout
curl -X POST http://localhost:3001/auth/logout -b cookies.txt
```

---

## WebSocket Support

Not currently implemented. For real-time features, consider:
- NestJS WebSocket Gateway
- Socket.io integration
- Real-time task updates across clients

---

## API Versioning

Currently no versioning. For future:
- Add `/api/v1/` prefix
- Support multiple versions simultaneously
- Deprecation notices in headers

