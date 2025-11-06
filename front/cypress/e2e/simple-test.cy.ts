describe('Simple Test - Login Only', () => {
  it('should display login page', () => {
    cy.visit('/');
    cy.contains('Welcome Back').should('be.visible');
    cy.log('✅ Test passed!');
  });

  it('should have login form fields', () => {
    cy.visit('/');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', 'Login').should('be.visible');
    cy.log('✅ All form fields present!');
  });
});

