// Test utility types
export interface MockUser {
  username: string;
  passwordHash: string;
  createdAt: string;
}

// Mock function types
export type MockBcryptHash = jest.MockedFunction<
  (password: string, saltRounds: number) => Promise<string>
>;
export type MockBcryptCompare = jest.MockedFunction<
  (password: string, hash: string) => Promise<boolean>
>;

export interface MockElasticsearchResponse<T = unknown> {
  hits: {
    hits: Array<{
      _source: T;
    }>;
  };
}

export interface MockElasticsearchIndexResponse {
  _id: string;
  _index: string;
  _version: number;
  result: string;
}

// API Response types
export interface RegisterSuccessResponse {
  message: string;
}

export interface RegisterErrorResponse {
  error: string;
}

export interface LoginSuccessResponse {
  ok: boolean;
}

export interface LoginErrorResponse {
  error: string;
}

// Form data types
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Error types
export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}
