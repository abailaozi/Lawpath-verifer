import { POST } from "../register/route";
import { getUserByUsername, createUser } from "@/lib/userRepo";
import bcrypt from "bcryptjs";
import {
  MockUser,
  RegisterSuccessResponse,
  RegisterErrorResponse,
  MockBcryptHash,
} from "../../../__tests__/types";

// Mock dependencies
jest.mock("@/lib/userRepo");
jest.mock("bcryptjs");
jest.mock("@/lib/elastic", () => ({
  ensureIndices: jest.fn().mockResolvedValue(true),
}));

const mockGetUserByUsername = getUserByUsername as jest.MockedFunction<
  typeof getUserByUsername
>;
const mockCreateUser = createUser as jest.MockedFunction<typeof createUser>;
const mockBcryptHash = bcrypt.hash as MockBcryptHash;

describe("/api/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should register a new user successfully", async () => {
      const requestBody = {
        username: "test@example.com",
        password: "TestPassword123!",
      };

      mockGetUserByUsername.mockResolvedValue(null); // User doesn't exist
      mockBcryptHash.mockResolvedValue("hashed-password");
      mockCreateUser.mockResolvedValue(undefined);

      const request = new Request("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as RegisterSuccessResponse;

      expect(response.status).toBe(201);
      expect(data.message).toBe("User created successfully");
      expect(mockGetUserByUsername).toHaveBeenCalledWith("test@example.com");
      expect(mockBcryptHash).toHaveBeenCalledWith("TestPassword123!", 10);
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: "test@example.com",
        passwordHash: "hashed-password",
      });
    });

    it("should return 400 when username is missing", async () => {
      const requestBody = {
        password: "TestPassword123!",
      };

      const request = new Request("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as RegisterErrorResponse;

      expect(response.status).toBe(400);
      expect(data.error).toBe("Username and password are required");
    });

    it("should return 400 when password is missing", async () => {
      const requestBody = {
        username: "test@example.com",
      };

      const request = new Request("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as RegisterErrorResponse;

      expect(response.status).toBe(400);
      expect(data.error).toBe("Username and password are required");
    });

    it("should return 409 when user already exists", async () => {
      const requestBody = {
        username: "test@example.com",
        password: "TestPassword123!",
      };

      const existingUser: MockUser = {
        username: "test@example.com",
        passwordHash: "existing-hash",
        createdAt: "2023-01-01T00:00:00.000Z",
      };

      mockGetUserByUsername.mockResolvedValue(existingUser);

      const request = new Request("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as RegisterErrorResponse;

      expect(response.status).toBe(409);
      expect(data.error).toBe("Username already exists");
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it("should return 500 when database error occurs", async () => {
      const requestBody = {
        username: "test@example.com",
        password: "TestPassword123!",
      };

      mockGetUserByUsername.mockRejectedValue(new Error("Database error"));

      const request = new Request("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as RegisterErrorResponse;

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
