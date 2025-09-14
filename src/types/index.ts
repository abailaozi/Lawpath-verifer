/**
 * TypeScript Type Definitions
 *
 * Centralized type definitions for the Lawpath Verifier application.
 * Includes test utilities, API responses, form data, and error handling types.
 *
 * @module types
 * @fileoverview Comprehensive type definitions for type safety and developer experience
 */

// ============================================================================
// Test Utility Types
// ============================================================================

/**
 * Mock user data structure for testing
 *
 * Represents a user object as stored in the database for test scenarios.
 */
export interface MockUser {
  username: string; // User's email address (normalized)
  passwordHash: string; // Bcrypt hashed password
  createdAt: string; // ISO timestamp of account creation
}

/**
 * Mock bcrypt hash function type for testing
 *
 * Jest mock type for bcrypt.hash function used in password hashing tests.
 */
export type MockBcryptHash = jest.MockedFunction<
  (password: string, saltRounds: number) => Promise<string>
>;

/**
 * Mock bcrypt compare function type for testing
 *
 * Jest mock type for bcrypt.compare function used in password verification tests.
 */
export type MockBcryptCompare = jest.MockedFunction<
  (password: string, hash: string) => Promise<boolean>
>;

/**
 * Mock Elasticsearch search response structure
 *
 * Generic type for Elasticsearch search responses in test scenarios.
 * Supports any document type through generic parameter.
 */
export interface MockElasticsearchResponse<T = unknown> {
  hits: {
    hits: Array<{
      _source: T; // Document source data
    }>;
  };
}

/**
 * Mock Elasticsearch index operation response
 *
 * Response structure for Elasticsearch index operations (create, update, delete).
 */
export interface MockElasticsearchIndexResponse {
  _id: string; // Document ID
  _index: string; // Index name
  _version: number; // Document version
  result: string; // Operation result status
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Successful user registration response
 *
 * Response structure for successful user registration API calls.
 */
export interface RegisterSuccessResponse {
  message: string; // Success message
}

/**
 * User registration error response
 *
 * Response structure for failed user registration API calls.
 */
export interface RegisterErrorResponse {
  error: string; // Error message describing the failure
}

/**
 * Successful user login response
 *
 * Response structure for successful user login API calls.
 * Note: Authentication token is set via HTTP-only cookie, not in response body.
 */
export interface LoginSuccessResponse {
  ok: boolean; // Success indicator
}

/**
 * User login error response
 *
 * Response structure for failed user login API calls.
 */
export interface LoginErrorResponse {
  error: string; // Error message describing the failure
}

// ============================================================================
// Form Data Types
// ============================================================================

/**
 * User registration form data
 *
 * Data structure for user registration form inputs.
 * Includes validation for password confirmation.
 */
export interface RegisterFormData {
  email: string; // User's email address
  password: string; // User's password
  confirmPassword: string; // Password confirmation for validation
}

/**
 * User login form data
 *
 * Data structure for user login form inputs.
 * Minimal structure for authentication.
 */
export interface LoginFormData {
  email: string; // User's email address
  password: string; // User's password
}

// ============================================================================
// Error Handling Types
// ============================================================================

/**
 * Form validation error structure
 *
 * Comprehensive error handling for form validation across the application.
 * Supports field-specific errors and general form errors.
 */
export interface FormErrors {
  email?: string; // Email field validation error
  password?: string; // Password field validation error
  confirmPassword?: string; // Password confirmation validation error
  general?: string; // General form error (e.g., network errors)
}
