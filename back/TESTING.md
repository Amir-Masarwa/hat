# Testing Documentation

## Test Coverage

This project includes comprehensive unit and integration tests covering:
- Authentication (signup, login, verification)
- Account lockout after failed attempts
- Email verification with expiry and attempt limits
- IP allow-list restrictions
- Tasks API CRUD operations
- Protected routes

## Running Tests

### Run All Tests
```bash
cd back
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run E2E Tests
```bash
npm run test:e2e
```

## Test Files

### Unit Tests

#### `src/auth/auth.service.spec.ts`
Tests for authentication service:
- ✓ User registration with verification code
- ✓ Duplicate email rejection
- ✓ Login with correct credentials
- ✓ Login blocked from non-allowed IPs
- ✓ Unverified user login rejection
- ✓ Invalid password rejection
- ✓ Account lockout after 3 failed login attempts
- ✓ Locked account rejection
- ✓ Email verification with correct code
- ✓ Expired verification code rejection
- ✓ 5 failed verification attempts blocking
- ✓ Failed verification counter increment
- ✓ Resend verification code with counter reset

#### `src/ip-allowlist/ip-allowlist.service.spec.ts`
Tests for IP allow-list service:
- ✓ Allow active IPs in the list
- ✓ Block IPs not in the list
- ✓ Block inactive IPs
- ✓ Handle database errors gracefully
- ✓ Add IP to allow-list
- ✓ Soft delete IPs (set isActive = false)
- ✓ Get all active IPs

### Integration Tests

#### `test/tasks.e2e-spec.ts`
End-to-end tests for Tasks API:
- ✓ Complete user flow (signup → verify → login)
- ✓ Create task with authentication
- ✓ Get all user tasks
- ✓ Update task
- ✓ Delete task
- ✓ Reject unauthenticated access
- ✓ Validate task creation input

## Test Coverage Summary

### Authentication
- User registration flow
- Email verification (1-minute expiry, 5 attempts)
- Login with password validation
- Account lockout (3 failed attempts → 2 minutes)
- IP allow-list restrictions
- Session management

### Tasks
- CRUD operations
- Authorization (users see only their tasks)
- Input validation
- Ordered by newest first

### Security
- IP-based access control
- Failed attempt tracking
- Tamper-resistant IP detection
- HttpOnly cookie sessions

## Test Database

E2E tests use the same database configured in `.env`. They clean up test data before and after runs.

For isolated testing, you can create a separate test database:
```env
# .env.test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_manager_test?schema=public"
```

## Mocking

Unit tests use Jest mocks for:
- PrismaService (database operations)
- EmailService (verification emails)
- JwtService (token generation)
- IpAllowlistService (IP checks)

## Best Practices

1. **Isolation**: Each test is independent
2. **Cleanup**: E2E tests clean database before/after
3. **Mocking**: External dependencies are mocked
4. **Coverage**: Tests cover happy paths and error cases
5. **Security**: Tests verify lockout, IP restrictions, and tamper resistance

## Adding New Tests

When adding features, create tests following this pattern:

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should handle success case', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle error case', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Continuous Integration

These tests can be run in CI/CD pipelines:
```yaml
# .github/workflows/test.yml
- run: npm install
- run: npm run test:cov
- run: npm run test:e2e
```

