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
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-maps-key";

// Mock TextEncoder and TextDecoder for jose library
global.TextEncoder = class TextEncoder {
  encode(input: string) {
    return new Uint8Array(Buffer.from(input, "utf8"));
  }
  encodeInto(input: string, destination: Uint8Array) {
    const encoded = this.encode(input);
    const length = Math.min(encoded.length, destination.length);
    destination.set(encoded.subarray(0, length));
    return { read: length, written: length };
  }
  get encoding() {
    return "utf-8";
  }
} as typeof TextEncoder;

global.TextDecoder = class TextDecoder {
  constructor(public label?: string, public options?: TextDecoderOptions) {}
  decode(input: Uint8Array) {
    return Buffer.from(input).toString("utf8");
  }
  get encoding() {
    return "utf-8";
  }
  get fatal() {
    return false;
  }
  get ignoreBOM() {
    return false;
  }
} as typeof TextDecoder;

// Mock window.location for tests - removed to avoid conflicts

// Mock Request and Response for API tests
global.Request = class Request {
  constructor(public url: string, public init?: RequestInit) {}
  async json() {
    return JSON.parse((this.init?.body as string) || "{}");
  }
} as typeof Request;

global.Response = class Response {
  constructor(public body: unknown, public init?: ResponseInit) {}
  json() {
    return Promise.resolve(this.body);
  }
} as typeof Response;

// Mock NextResponse for API route tests
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: ResponseInit) => {
      const response = {
        json: () => Promise.resolve(data),
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        cookies: {
          set: jest.fn(),
          delete: jest.fn(),
        },
      };
      return response;
    }),
    redirect: jest.fn((url: string) => ({
      status: 302,
      headers: new Headers({ Location: url }),
    })),
  },
}));

// Mock bcrypt for auth tests
jest.mock("bcryptjs", () => ({
  hash: jest.fn((password: string, saltRounds: number) =>
    Promise.resolve(`hashed_${password}_${saltRounds}`)
  ),
  compare: jest.fn((password: string, hash: string) =>
    Promise.resolve(hash === `hashed_${password}_10`)
  ),
}));

// Mock jose library for JWT operations
let tokenCounter = 0;
jest.mock("jose", () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockImplementation(() => {
      tokenCounter++;
      return Promise.resolve(
        `header${tokenCounter}.payload${tokenCounter}.signature${tokenCounter}`
      );
    }),
  })),
  jwtVerify: jest.fn().mockImplementation((token: string) => {
    // Return different results based on token content
    if (
      token === "invalid-token" ||
      token === "malformed-token" ||
      token === "" ||
      token === "invalid.token.here" ||
      token === "not-a-jwt-token"
    ) {
      return Promise.reject(new Error("Invalid token"));
    }
    return Promise.resolve({
      payload: { username: "test@example.com" },
    });
  }),
}));

// Mock Elasticsearch client
jest.mock("@/lib/elastic", () => ({
  client: {
    index: jest.fn(() => Promise.resolve({ _id: "test-id" })),
    search: jest.fn(() => Promise.resolve({ hits: { hits: [] } })),
    indices: {
      exists: jest.fn(() => Promise.resolve(false)),
      create: jest.fn(() => Promise.resolve({ acknowledged: true })),
    },
  },
}));
