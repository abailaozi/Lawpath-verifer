# Unit Testing Guide

## Test Coverage

### **Created Test Files**

1. **`src/lib/__tests__/auth.test.ts`** - JWT authentication functionality tests
2. **`src/lib/__tests__/userRepo.test.ts`** - User data access layer tests
3. **`src/app/api/__tests__/register.test.ts`** - Registration API tests
4. **`src/app/api/__tests__/login.test.ts`** - Login API tests
5. **`src/app/__tests__/register-page.test.tsx`** - Registration page component tests
6. **`src/app/__tests__/login-page.test.tsx`** - Login page component tests

## Running Tests

### **Install Dependencies**

```bash
npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest
```

### **Run All Tests**

```bash
npm test
```

### **Watch Mode (Recommended for Development)**

```bash
npm run test:watch
```

### **Generate Coverage Report**

```bash
npm run test:coverage
```

## Test Types

### **1. Unit Tests**

- **auth.test.ts**: JWT signing and verification
- **userRepo.test.ts**: Database operation functions

### **2. API Tests (Integration Tests)**

- **register.test.ts**: Registration API endpoints
- **login.test.ts**: Login API endpoints

### **3. Component Tests**

- **register-page.test.tsx**: Registration page UI interactions
- **login-page.test.tsx**: Login page UI interactions

## Test Scenarios

### **Authentication Features**

- JWT token creation and verification
- Invalid token handling
- Empty token handling

### **User Management**

- User lookup (exists/doesn't exist)
- User creation
- Database error handling

### **API Endpoints**

- Successful registration
- Duplicate user registration
- Missing field validation
- Successful login
- Invalid credentials
- Server error handling

### **UI Components**

- Form rendering
- Input validation
- Error display
- Successful submission
- Loading states
- User interactions

## Test Configuration

### **Jest Configuration** (`jest.config.js`)

- Next.js integration
- TypeScript support
- Path alias mapping
- Test environment setup

### **Test Setup** (`src/setupTests.ts`)

- DOM testing utilities
- Next.js router mocking
- Fetch API mocking
- Environment variable setup

## Coverage Goals

- **Statement Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Function Coverage**: > 90%
- **Line Coverage**: > 90%

## Adding New Tests

### **Create New Test File**

```bash
# Create __tests__ folder in corresponding directory
mkdir src/your-module/__tests__

# Create test file
touch src/your-module/__tests__/your-module.test.ts
```

### **Test File Naming Conventions**

- Component tests: `component-name.test.tsx`
- Function tests: `function-name.test.ts`
- API tests: `api-endpoint.test.ts`

## Debugging Tests

### **Run Specific Tests**

```bash
# Run specific file
npm test auth.test.ts

# Run specific test suite
npm test -- --testNamePattern="should create a valid JWT token"
```

### **Verbose Output**

```bash
npm test -- --verbose
```

## Testing Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Test Names**: Clearly describe test purpose
3. **Single Responsibility**: Each test verifies one functionality
4. **Mock External Dependencies**: Ensure test isolation
5. **Clean State**: Reset state after each test
