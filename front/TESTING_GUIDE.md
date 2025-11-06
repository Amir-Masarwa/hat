# Complete User Journey E2E Testing

This test covers the **entire user workflow** in a real browser using Cypress.

## 🎯 What This Test Does:

1. ✅ **Login** with your credentials
2. ✅ **Create** a new task
3. ✅ **Mark it as complete** (toggle checkbox)
4. ✅ **Edit** the task (change title and description)
5. ✅ **Delete** the task
6. ✅ **Refresh page** and verify you're still logged in (session persistence)
7. ✅ **Logout** and verify redirect to login page

---

## 🚀 How to Run the Test

### Prerequisites:

Make sure these are running:

```powershell
# Terminal 1: Database
cd db
docker-compose up

# Terminal 2: Backend
cd back
npm run start:dev

# Terminal 3: Frontend
cd front
npm start
```

---

### Important Setup:

#### 1. User Must Exist and Be Verified

Make sure the user `amirmas@post.gbu.ac.il` exists and is verified in the database.

**Via Prisma Studio:**
```powershell
cd back
npx prisma studio
```

Open `http://localhost:5555` → `User` table → Verify:
- ✅ Email: `amirmas@post.gbu.ac.il`
- ✅ `verified`: `true`
- ✅ Password is set

If not, sign up via the app first!

---

#### 2. Add Your IP to Allowlist

**Via Prisma Studio:**

Open `IpAllowList` table → Add these IPs:
- `127.0.0.1` (IPv4)
- `::1` (IPv6)
- `::ffff:127.0.0.1` (IPv4-mapped)

Set all to `isActive: true`

---

### Step 1: Install Cypress

```powershell
cd front
npm install
```

Wait ~2 minutes for Cypress to install.

---

### Step 2: Run the Test

**Option A: Interactive Mode (Recommended)**

```powershell
npm run cypress:open
```

1. Click **"E2E Testing"**
2. Choose **Chrome** browser
3. Click on **"complete-user-journey.cy.ts"**
4. **Watch it run!** 🎥

You'll see the test:
- Type in forms
- Click buttons
- Create/edit/delete tasks
- Refresh page
- Logout

All in a real browser!

---

**Option B: Headless Mode**

```powershell
npm run test:e2e
```

Runs the test in the background and shows results in terminal.

---

## 📹 What You'll See:

```
🚀 Starting Complete User Journey Test
📋 This test will:
  1. Login with credentials
  2. Create a task
  3. Mark it as complete
  4. Edit the task
  5. Delete the task
  6. Refresh page (test session persistence)
  7. Logout and verify redirect to login

Running tests...

  Complete User Journey - Full Task Workflow
    ✓ Complete workflow: Login → Create → Complete → Edit → Delete → Refresh → Logout (15234ms)
    ✓ Verify cannot access tasks page when logged out (1234ms)

  2 passing (17s)

🎉 ALL TESTS PASSED!
```

---

## 🎥 Cypress Features:

### Time Travel
- Click on any step in the test
- See exactly what the page looked like
- Inspect DOM at that moment

### Screenshots
- Auto-saved on failures
- Found in `cypress/screenshots/`

### Videos
- Full recording of test run
- Found in `cypress/videos/`

### Network Tab
- See all API calls
- Request/response data
- Timing information

---

## 🐛 Troubleshooting:

### "Login failed"
- ✅ Check user exists in database
- ✅ Check user is verified
- ✅ Check password is correct
- ✅ Check IP is in allowlist

### "Cannot find element"
- ✅ Frontend might still be loading
- ✅ Increase timeout: `cy.contains('Text', { timeout: 10000 })`

### "Network request failed"
- ✅ Make sure backend is running on port 3001
- ✅ Check backend logs for errors
- ✅ Verify CORS allows localhost

### "Session not persisting"
- ✅ Check cookies are being set
- ✅ Check JWT strategy reads from cookies
- ✅ Verify `withCredentials: true` in API config

---

## 📊 Test Details:

### Test File:
`front/cypress/e2e/complete-user-journey.cy.ts`

### User:
- **Email**: `amirmas@post.gbu.ac.il`
- **Password**: `masarwa112`

### What's Tested:
1. **Authentication** - Login with real credentials
2. **Task Creation** - Create task with title and description
3. **Task Completion** - Toggle checkbox to mark complete
4. **Task Editing** - Modify title and description
5. **Task Deletion** - Remove task with confirmation
6. **Session Persistence** - Refresh page, stay logged in
7. **Logout Flow** - Clear session, redirect to login
8. **Protected Routes** - Cannot access tasks when logged out

---

## 💡 Customization:

### Change Test User:

Edit `front/cypress/e2e/complete-user-journey.cy.ts`:

```typescript
const testEmail = 'your.email@example.com';
const testPassword = 'yourpassword';
```

### Add More Steps:

```typescript
// After creating task
cy.log('📌 Creating another task');
cy.get('input[placeholder="What needs to be done?"]').type('Second Task');
cy.contains('button', 'Create Task').click();
```

---

## ✨ Benefits of This Test:

✅ **Tests real user behavior** - Not mocked!  
✅ **Catches integration bugs** - Full stack working together  
✅ **Visual confirmation** - See it work in real browser  
✅ **Regression prevention** - Ensure features don't break  
✅ **Documentation** - Shows how app should work  

---

## 🚀 Quick Start:

```powershell
# Make sure everything is running
cd db && docker-compose up     # Terminal 1
cd back && npm run start:dev   # Terminal 2
cd front && npm start          # Terminal 3

# Install Cypress (one time)
cd front
npm install

# Run the test!
npm run cypress:open
```

Then click on `complete-user-journey.cy.ts` and watch the magic! ✨

---

Happy Testing! 🧪🎉

