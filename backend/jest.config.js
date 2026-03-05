// jest.config.js
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage",
  verbose: true,
  forceExit: true,
  clearMocks: true,
};
