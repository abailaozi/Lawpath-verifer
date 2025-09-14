import { signToken, verifyToken } from "../auth";

describe("Auth Functions", () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  describe("signToken", () => {
    it("should create a valid JWT token", () => {
      const username = "test@example.com";
      const token = signToken(username);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should create different tokens for different usernames", () => {
      const token1 = signToken("user1@example.com");
      const token2 = signToken("user2@example.com");

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const username = "test@example.com";
      const token = signToken(username);
      const decoded = verifyToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.username).toBe(username);
    });

    it("should return null for invalid token", () => {
      const invalidToken = "invalid.token.here";
      const result = verifyToken(invalidToken);

      expect(result).toBeNull();
    });

    it("should return null for malformed token", () => {
      const malformedToken = "not-a-jwt-token";
      const result = verifyToken(malformedToken);

      expect(result).toBeNull();
    });

    it("should return null for empty token", () => {
      const result = verifyToken("");

      expect(result).toBeNull();
    });
  });
});
