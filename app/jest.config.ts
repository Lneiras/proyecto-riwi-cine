// app/jest.config.ts

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  rootDir: ".",

  testMatch: [
    "<rootDir>/src/tests/**/*.test.ts",
  ],

  moduleFileExtensions: [
    "ts",
    "js",
    "json",
    "node",
  ],

  clearMocks: true,

  setupFiles: [
    "<rootDir>/src/tests/setup.ts",
  ],

  coverageDirectory: "<rootDir>/coverage",
};

export default config;
