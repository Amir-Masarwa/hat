# IP Allow-List Feature

This feature restricts login access based on client IP addresses.

## How It Works

1. **On login**, the backend checks if the client's IP is in the `IpAllowList` table
2. If the IP is **not** in the list or is marked as `isActive = false`, login is **denied**
3. Denied attempts are logged to `back/ip-denied-attempts.log` with timestamp, IP, email, and user-agent
4. The check is **tamper-resistant** (uses `req.ip` directly, not spoofable headers)

## Setup

### 1. Run Migration

```bash
cd back
npx prisma migrate dev --name add-ip-allowlist
npx prisma generate
```

### 2. Add Allowed IPs

Use the API or Prisma Studio to add allowed IPs:

**Via API:**
```bash
# Add your local IP
curl -X POST http://localhost:3001/ip-allowlist \
  -H "Content-Type: application/json" \
  -d '{"ip": "127.0.0.1", "label": "Localhost"}'

# Add another IP
curl -X POST http://localhost:3001/ip-allowlist \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "label": "Office Network"}'
```

**Via Prisma Studio:**
```bash
npx prisma studio
```
- Go to `IpAllowList` table
- Click "Add record"
- Enter IP and optional label
- Save

### 3. Find Your IP

To find your current IP:
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig

# Or check what the backend sees (check console logs on login)
```

For local development, add `127.0.0.1` and `::1` (IPv6 localhost).

## API Endpoints

### Get All Allowed IPs
```
GET /ip-allowlist
```

### Add IP to Allow-List
```
POST /ip-allowlist
Body: { "ip": "1.2.3.4", "label": "Office" }
```

### Remove IP (soft delete - sets isActive = false)
```
DELETE /ip-allowlist/:ip
```

## Denied Attempts Log

All denied login attempts are logged to:
```
back/ip-denied-attempts.log
```

Format:
```
[2025-11-03T10:30:45.123Z] DENIED - IP: 192.168.1.50 | Email: user@example.com | UserAgent: Mozilla/5.0...
```

## Security Notes

- The IP check happens **before** password validation (fail fast)
- Uses `req.ip` which is set by Express based on the actual connection
- For production behind a proxy (nginx, load balancer), configure Express to trust proxy headers in `main.ts`:
  ```typescript
  app.set('trust proxy', true);
  ```
- The log file is excluded from git (via `.gitignore`)

## Testing

1. Add your IP to the allow-list
2. Try logging in → should work
3. Remove your IP or set `isActive = false`
4. Try logging in → should get "Login is restricted from your IP address. Contact support."
5. Check `back/ip-denied-attempts.log` for the logged denial

## Production Considerations

- Use environment-specific allow-lists (dev/staging/prod)
- Consider adding CIDR range support for networks
- Implement admin-only endpoints to manage the allow-list
- Monitor the denied attempts log for suspicious activity

