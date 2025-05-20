/**
 * Basic E2E test for player piano application
 */
describe('Player Piano', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have the correct title', () => {
    cy.title().should('eq', 'Player Piano');
  });

  it('should display the main UI components', () => {
    cy.contains('h1', 'PLAYER PIANO').should('be.visible');
    cy.get('#stop-button').should('be.visible');
    cy.get('#output-toggle').should('be.visible');
    cy.get('#piano-visualization').should('be.visible');
    cy.get('#data-display').should('be.visible');
  });

  it('should show initialization messages in the data display', () => {
    cy.get('#terminal-content').contains('PLAYER PIANO INITIALIZED');
    cy.get('#terminal-content').contains('WAITING FOR SERVER CONNECTION');
  });

  it('should respond to stop button click', () => {
    cy.get('#stop-button').click();
    cy.get('#terminal-content').contains('PLAYBACK STOPPED');
  });

  it('should toggle output mode when switch is clicked', () => {
    cy.get('#output-toggle').click({ force: true });
    cy.get('#terminal-content').contains('OUTPUT MODE: MIDI');
    
    cy.get('#output-toggle').click({ force: true });
    cy.get('#terminal-content').contains('OUTPUT MODE: WEB AUDIO');
  });
});