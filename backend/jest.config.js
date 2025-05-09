// jest.config.js
export default {
  transform: {},  // Empty object since we're using native ESM
  testEnvironment: 'node',
  // Remove extensionsToTreatAsEsm since your project is already type:module
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-to-be-transformed)/)'
  ]
};