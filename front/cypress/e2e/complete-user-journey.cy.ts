describe('Complete User Journey - Full Task Workflow', () => {
  // Test user credentials
  const testEmail = 'amirmas@post.gbu.ac.il';
  const testPassword = 'masarwa112';
  
  before(() => {
    cy.log('🚀 Starting Complete User Journey Test');
    cy.log('📋 This test will:');
    cy.log('  1. Login with credentials');
    cy.log('  2. Create a task');
    cy.log('  3. Mark it as complete');
    cy.log('  4. Edit the task');
    cy.log('  5. Delete the task');
    cy.log('  6. Refresh page (test session persistence)');
    cy.log('  7. Logout and verify redirect to login');
    cy.log('');
    cy.log('⚠️  Prerequisites:');
    cy.log('  - Backend running: cd back && npm run start:dev');
    cy.log('  - Frontend running: cd front && npm start');
    cy.log('  - Database running: cd db && docker-compose up');
    cy.log('  - User must exist and be verified in database');
    cy.log('  - User IP must be in allowlist');
  });

  beforeEach(() => {
    // Clear cookies before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('Complete workflow: Login → Create → Complete → Edit → Delete → Refresh → Logout', () => {
    // ============================================
    // STEP 1: LOGIN
    // ============================================
    cy.log('🔐 Step 1: Login');
    cy.visit('/');
    
    // Should see login page
    cy.contains('Welcome Back', { timeout: 10000 }).should('be.visible');
    
    // Fill login form
    cy.get('input[type="email"]').clear().type(testEmail);
    cy.get('input[type="password"]').clear().type(testPassword);
    
    // Submit login
    cy.contains('button', 'Login').click();
    
    // Wait for successful login and task page to load
    cy.contains('Task Manager', { timeout: 10000 }).should('be.visible');
    cy.contains('My Tasks').should('be.visible');
    cy.contains('Create New Task').should('be.visible');
    
    cy.screenshot('01-after-login');
    cy.log('✅ Login successful!');
    
    // ============================================
    // STEP 2: CREATE A TASK
    // ============================================
    cy.log('➕ Step 2: Create a task');
    
    const taskTitle = `Test Task ${Date.now()}`;
    const taskDescription = 'This is a test task created by Cypress';
    
    // Fill task creation form
    cy.get('input[placeholder="What needs to be done?"]')
      .clear()
      .type(taskTitle);
    
    cy.get('textarea[placeholder="Add more details..."]')
      .clear()
      .type(taskDescription);
    
    // Create the task
    cy.contains('button', 'Create Task').click();
    
    // Verify task appears in list
    cy.contains(taskTitle, { timeout: 5000 }).should('be.visible');
    cy.contains(taskDescription).should('be.visible');
    
    cy.screenshot('02-after-task-created');
    cy.log('✅ Task created successfully!');
    
    // ============================================
    // STEP 3: MARK TASK AS COMPLETE
    // ============================================
    cy.log('✓ Step 3: Mark task as complete');
    
    // Find the task and click its checkbox
    cy.contains(taskTitle)
      .closest('[class*="border"][class*="rounded-lg"]')
      .within(() => {
        cy.get('input[type="checkbox"]').first().click();
      });
    
    // Wait a bit for the update
    cy.wait(2000);
    
    // Verify task is marked as complete (should have gray background)
    cy.contains(taskTitle)
      .closest('[class*="bg-gray-50"]')
      .should('exist');
    
    cy.screenshot('03-after-task-completed');
    cy.log('✅ Task marked as complete!');
    
    // ============================================
    // STEP 4: EDIT THE TASK
    // ============================================
    cy.log('✏️ Step 4: Edit the task');
    
    const updatedTitle = `${taskTitle} - EDITED`;
    const updatedDescription = 'This task has been edited by Cypress';
    
    // Click edit button - find the task card by searching for any text content
    cy.get('[class*="border"][class*="rounded-lg"]')
      .contains(taskTitle)
      .parents('[class*="border"][class*="rounded-lg"]')
      .first()
      .within(() => {
        // Find the edit button within this specific task card (button says "Edit")
        cy.contains('button', 'Edit').click();
      });
    
    // Should show edit form
    cy.get('input[name="title"]').should('be.visible');
    
    // Update the task
    cy.get('input[name="title"]').clear().type(updatedTitle);
    cy.get('textarea[name="description"]').clear().type(updatedDescription);
    
    // Save changes
    cy.contains('button', 'Save').click();
    
    // Verify updated content appears
    cy.contains(updatedTitle, { timeout: 5000 }).should('be.visible');
    cy.contains(updatedDescription).should('be.visible');
    
    cy.screenshot('04-after-task-edited');
    cy.log('✅ Task edited successfully!');
    
    // ============================================
    // STEP 5: DELETE THE TASK
    // ============================================
    cy.log('🗑️ Step 5: Delete the task');
    
    // Mock window.confirm to return true
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    
    // Click delete button - find the task card first
    cy.get('[class*="border"][class*="rounded-lg"]')
      .contains(updatedTitle)
      .parents('[class*="border"][class*="rounded-lg"]')
      .first()
      .within(() => {
        // Find delete button within this specific task (button says "Delete")
        cy.contains('button', 'Delete').click();
      });
    
    // Wait for deletion
    cy.wait(1000);
    
    // Verify task is gone
    cy.contains(updatedTitle).should('not.exist');
    
    cy.screenshot('05-after-task-deleted');
    cy.log('✅ Task deleted successfully!');
    
    // ============================================
    // STEP 6: REFRESH PAGE (Test Session Persistence)
    // ============================================
    cy.log('🔄 Step 6: Refresh page to test session persistence');
    
    cy.reload();
    
    // Should STILL be on task page (not redirected to login)
    cy.contains('Task Manager', { timeout: 10000 }).should('be.visible');
    cy.contains('My Tasks').should('be.visible');
    cy.contains('Create New Task').should('be.visible');
    
    // Should NOT see login page
    cy.contains('Welcome Back').should('not.exist');
    
    cy.screenshot('06-after-page-refresh-still-logged-in');
    cy.log('✅ Session persisted after refresh!');
    
    // ============================================
    // STEP 7: LOGOUT (Test Redirect to Login)
    // ============================================
    cy.log('👋 Step 7: Logout and verify redirect');
    
    // Click logout button
    cy.contains('button', 'Log out').click();
    
    // Should redirect to login page
    cy.contains('Welcome Back', { timeout: 5000 }).should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    
    // Should NOT see task page
    cy.contains('My Tasks').should('not.exist');
    
    cy.screenshot('07-after-logout-back-to-login');
    cy.log('✅ Logout successful and redirected to login!');
    
    // ============================================
    // FINAL VERIFICATION
    // ============================================
    cy.screenshot('08-final-all-tests-passed');
    cy.log('🎉 ALL TESTS PASSED!');
    cy.log('✅ Login works');
    cy.log('✅ Task creation works');
    cy.log('✅ Task completion works');
    cy.log('✅ Task editing works');
    cy.log('✅ Task deletion works');
    cy.log('✅ Session persistence works (refresh)');
    cy.log('✅ Logout redirect works');
  });

  it('Verify cannot access tasks page when logged out', () => {
    cy.log('🔒 Verifying protected routes');
    
    // Try to visit root while logged out
    cy.visit('/');
    
    // Should show login page (protected route)
    cy.contains('Welcome Back', { timeout: 5000 }).should('be.visible');
    
    // Should NOT show task page
    cy.contains('My Tasks').should('not.exist');
    
    cy.log('✅ Protected routes working correctly!');
  });
});

