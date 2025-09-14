import { POST } from "../login/route";
import { getUserByUsername } from "@/lib/userRepo";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import {
  MockUser,
  LoginSuccessResponse,
  LoginErrorResponse,
  MockBcryptCompare,
} from "@/types";

// Mock dependencies
jest.mock("@/lib/userRepo");
jest.mock("@/lib/auth");
jest.mock("bcryptjs");

const mockGetUserByUsername = getUserByUsername as jest.MockedFunction<
  typeof getUserByUsername
>;
const mockSignToken = signToken as jest.MockedFunction<typeof signToken>;
const mockBcryptCompare = bcrypt.compare as MockBcryptCompare;

describe("/api/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should login user successfully", async () => {
      const requestBody = {
        username: "test@example.com",
        password: "TestPassword123!",
      };

      const mockUser: MockUser = {
        username: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: "2023-01-01T00:00:00.000Z",
      };

      mockGetUserByUsername.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(true);
      mockSignToken.mockResolvedValue("jwt-token");

      const request = new Request("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as LoginSuccessResponse;

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(mockGetUserByUsername).toHaveBeenCalledWith("test@example.com");
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        "TestPassword123!",
        "hashed-password"
      );
      expect(mockSignToken).toHaveBeenCalledWith("test@example.com");
    });

    it("should return 400 when username is missing", async () => {
      const requestBody = {
        password: "TestPassword123!",
      };

      const request = new Request("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as LoginErrorResponse;

      expect(response.status).toBe(400);
      expect(data.error).toBe("Username and password are required");
    });

    it("should return 400 when password is missing", async () => {
      const requestBody = {
        username: "test@example.com",
      };

      const request = new Request("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as LoginErrorResponse;

      expect(response.status).toBe(400);
      expect(data.error).toBe("Username and password are required");
    });

    it("should return 401 when user not found", async () => {
      const requestBody = {
        username: "nonexistent@example.com",
        password: "TestPassword123!",
      };

      mockGetUserByUsername.mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as LoginErrorResponse;

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid credentials");
      expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    it("should return 401 when password is incorrect", async () => {
      const requestBody = {
        username: "test@example.com",
        password: "WrongPassword123!",
      };

      const mockUser: MockUser = {
        username: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: "2023-01-01T00:00:00.000Z",
      };

      mockGetUserByUsername.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(false);

      const request = new Request("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as LoginErrorResponse;

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid credentials");
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        "WrongPassword123!",
        "hashed-password"
      );
      expect(mockSignToken).not.toHaveBeenCalled();
    });

    it("should return 500 when database error occurs", async () => {
      const requestBody = {
        username: "test@example.com",
        password: "TestPassword123!",
      };

      mockGetUserByUsername.mockRejectedValue(new Error("Database error"));

      const request = new Request("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = (await response.json()) as LoginErrorResponse;

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
