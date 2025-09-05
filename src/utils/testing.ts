import React from 'react';

// Testing utilities for development and QA
export const testHelpers = {
  // Generate test data
  generateTestPuppy: (overrides = {}) => ({
    id: `test-${Date.now()}`,
    name: 'Test Puppy',
    breed: 'Golden Retriever',
    price: 1500,
    description: 'A wonderful test puppy',
    images: ['/placeholder.svg'],
    status: 'available',
    birthDate: new Date().toISOString(),
    ...overrides,
  }),

  generateTestUser: (overrides = {}) => ({
    id: `user-${Date.now()}`,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  // Mock API responses
  mockApiSuccess: (data: any) => 
    Promise.resolve({ ok: true, json: () => Promise.resolve(data) }),

  mockApiError: (status: number, message: string) =>
    Promise.reject(new Error(`${status}: ${message}`)),

  // Test scenarios
  simulateSlowNetwork: (delay = 2000) => 
    new Promise(resolve => setTimeout(resolve, delay)),

  // Component testing helpers
  waitForElement: (selector: string, timeout = 5000) => {
    return new Promise<Element>((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        } else {
          setTimeout(check, 100);
        }
      };
      
      check();
    });
  },
};

// Development mode testing panel
export const TestingPanel: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const runTests = () => {
    console.log('Running development tests...');
    // Add your test scenarios here
  };

  return React.createElement('div', {
    className: 'fixed bottom-4 right-4 p-4 bg-muted rounded-lg shadow-lg'
  }, [
    React.createElement('h3', { 
      key: 'title',
      className: 'font-semibold mb-2' 
    }, 'Dev Tools'),
    React.createElement('button', {
      key: 'button',
      onClick: runTests,
      className: 'px-3 py-1 bg-primary text-primary-foreground rounded text-sm'
    }, 'Run Tests')
  ]);
};