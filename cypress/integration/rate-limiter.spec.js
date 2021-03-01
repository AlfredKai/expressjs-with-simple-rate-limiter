/// <reference types="cypress" />

const window = 1000;
const reqCountHeaderName = 'request-count-in-window';
const baseUrl = 'http://localhost:3000';

context('Rate-Limiting', { baseUrl }, () => {
  afterEach(() => {
    cy.wait(window);
  });

  it('should return 429 when exceeding the max and reset after window expire. (max:5, window:1)', () => {
    const testUrl = 'test/rate-limiting-max-5-window-1';
    const window = 1000;

    ['1', '2', '3', '4', '5'].forEach((expectRequestCount) => {
      cy.request(testUrl).should((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers)
          .property(reqCountHeaderName)
          .to.eq(expectRequestCount);
      });
    });

    cy.request({
      url: testUrl,
      failOnStatusCode: false,
    }).should((response) => {
      expect(response.status).to.eq(429);
    });

    cy.wait(window);

    ['1', '2', '3', '4', '5'].forEach((expectRequestCount) => {
      cy.request(testUrl).should((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers)
          .property(reqCountHeaderName)
          .to.eq(expectRequestCount);
      });
    });

    // clean up
    cy.wait(window);
  });

  it('should return 429 when exceeding the max and reset after window expire. (max:3, window:2)', () => {
    const window = 2000;
    const testUrl = 'test/rate-limiting-max-3-window-2';

    ['1', '2', '3'].forEach((expectRequestCount) => {
      cy.request(testUrl).should((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers).property(reqCountHeaderName).to.eq(expectRequestCount);
      });
    });

    cy.request({
      url: testUrl,
      failOnStatusCode: false,
    }).should((response) => {
      expect(response.status).to.eq(429);
    });

    cy.wait(window / 2);

    cy.request({
      url: testUrl,
      failOnStatusCode: false,
    }).should((response) => {
      expect(response.status).to.eq(429);
    });

    cy.wait(window / 2);

    ['1', '2', '3'].forEach((expectRequestCount) => {
      cy.request(testUrl).should((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers).property(reqCountHeaderName).to.eq(expectRequestCount);
      });
    });

    cy.request({
      url: testUrl,
      failOnStatusCode: false,
    }).should((response) => {
      expect(response.status).to.eq(429);
    });
  });
});
