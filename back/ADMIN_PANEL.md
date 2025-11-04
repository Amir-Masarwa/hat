# Admin Panel Documentation

## Overview

The Admin Panel allows administrators to manage the IP allow-list directly from the web UI.

## Setup

### 1. Run Migration

```bash
cd back
npx prisma migrate dev --name add-admin-field
npx prisma generate
```

### 2. Create an Admin User

You need to manually set a user as admin in the database:

**Option A: Via Prisma Studio**
```bash
npx prisma studio
```
- Go to the `User` table
- Find your user
- Set `isAdmin` to `true`
- Save

**Option B: Via SQL**
```sql
-- Connect to database
psql -h localhost -p 5432 -U postgres -d task_manager

-- Make a user admin by email
UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';
```

**Option C: Via Script**
Create a file `back/scripts/make-admin.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: ts-node scripts/make-admin.ts user@email.com');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log(`✓ ${user.email} is now an admin`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with:
```bash
npx ts-node scripts/make-admin.ts your@email.com
```

### 3. Restart Backend

```bash
npm run start:dev
```

## Using the Admin Panel

### Access

1. Log in as an admin user
2. The Admin Panel appears on the right side of the screen
3. Non-admin users won't see it

### Features

#### View All IPs
- See all IPs in the allow-list (active and inactive)
- Green background = Active
- Gray background = Inactive
- Shows IP, label, and date added

#### Add New IP
1. Enter IP address (e.g., `127.0.0.1`, `::1`, `192.168.1.100`)
2. Add optional label (e.g., "Office", "VPN", "Home")
3. Click "Add IP"
4. IP is immediately active and users from that IP can log in

#### Deactivate IP
- Click "Deactivate" on any active IP
- Users from that IP will be blocked from logging in
- IP remains in database but `isActive = false`

#### Reactivate IP
- Click "Activate" on any inactive IP
- IP becomes active again
- Users from that IP can log in

## Security

### Backend Protection

- All IP management endpoints require:
  1. Valid JWT (authenticated user)
  2. `isAdmin = true` in the database
- Protected by `AdminGuard` which checks the database (not just the JWT)
- Tamper-resistant (can't bypass by modifying client-side code)

### API Endpoints (Admin Only)

```
GET    /ip-allowlist          - List all IPs
POST   /ip-allowlist          - Add new IP
DELETE /ip-allowlist/:ip      - Deactivate IP
POST   /ip-allowlist/:ip/activate - Reactivate IP
```

## Testing

### Test Admin Access

1. Create a normal user and log in → no admin panel shown
2. Make that user an admin in the database
3. Log out and log in again → admin panel appears
4. Try managing IPs → should work

### Test Non-Admin Blocking

```bash
# Try accessing as non-admin (should fail with 403)
curl http://localhost:3001/ip-allowlist \
  -H "Cookie: token=NON_ADMIN_TOKEN"
# Response: 403 Forbidden - Admin access required
```

## Best Practices

1. **Minimal Admins**: Only make trusted users admins
2. **Audit Logging**: Consider logging all IP list changes (who added/removed what)
3. **Regular Review**: Periodically review and clean up unused IPs
4. **Production**: Use environment variables for initial admin email
5. **Monitoring**: Watch `ip-denied-attempts.log` for suspicious activity

## Troubleshooting

### Admin Panel Not Showing
- Check `isAdmin` field in database (must be `true`)
- Log out and log in again (session refresh)
- Check browser console for errors
- Verify backend migration was run

### "Admin access required" Error
- User's `isAdmin` field is `false` or user doesn't exist
- Run the migration: `npx prisma migrate dev`
- Manually set `isAdmin = true` in database

### IPs Not Taking Effect
- Check if IP was added correctly (view in Prisma Studio)
- Check `isActive` field is `true`
- Restart backend if needed
- Check your actual IP in `ip-denied-attempts.log`

## Future Enhancements

- Bulk import IPs from CSV
- IP range/CIDR support (e.g., `192.168.1.0/24`)
- Temporary IP access (expiring allow-list entries)
- IP allow-list per user (different lists for different users)
- Activity log showing who modified the allow-list

