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
    it("should create a valid JWT token", async () => {
      const username = "test@example.com";
      const token = await signToken(username);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should create different tokens for different usernames", async () => {
      const token1 = await signToken("user1@example.com");
      const token2 = await signToken("user2@example.com");

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", async () => {
      const username = "test@example.com";
      const token = await signToken(username);
      const decoded = await verifyToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.username).toBe(username);
    });

    it("should return null for invalid token", async () => {
      const invalidToken = "invalid.token.here";
      const result = await verifyToken(invalidToken);

      expect(result).toBeNull();
    });

    it("should return null for malformed token", async () => {
      const malformedToken = "not-a-jwt-token";
      const result = await verifyToken(malformedToken);

      expect(result).toBeNull();
    });

    it("should return null for empty token", async () => {
      const result = await verifyToken("");

      expect(result).toBeNull();
    });
  });
});
