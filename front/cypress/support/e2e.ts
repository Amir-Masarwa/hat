// ***********************************************************
// This file is processed and loaded automatically before test files.
// ***********************************************************

/// <reference types="cypress" />

// Prevent Cypress from failing on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // on uncaught exceptions (like network errors, etc.)
  console.log('Caught exception:', err.message);
  return false;
});

// Custom command declarations
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here if needed
    }
  }
}

export {};

