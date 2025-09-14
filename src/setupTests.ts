import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
process.env.USER_INDEX = "test-users";
process.env.LOGS_INDEX = "test-logs";
process.env.JWT_SECRET = "test-secret";
