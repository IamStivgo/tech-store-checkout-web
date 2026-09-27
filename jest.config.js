export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  setupFilesAfterEnv: ['<rootDir>/test/setup-tests.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx', '!src/**/*.d.ts'],
  coverageReporters: ['text-summary', 'json-summary', 'lcov', 'html'],
  coverageThreshold: {
    global: { statements: 85, lines: 85, functions: 85, branches: 81 },
  },
};
