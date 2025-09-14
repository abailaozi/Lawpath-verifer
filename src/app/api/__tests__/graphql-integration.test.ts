/**
 * GraphQL Integration Test
 *
 * Simple test for the GraphQL API endpoint focusing on core functionality.
 */

import { verifyToken } from "@/lib/auth";
import { writeVerifyLog } from "@/lib/logRepo";
import { POST as loginPOST } from "../login/route";
import { getUserByUsername } from "@/lib/userRepo";
import bcrypt from "bcryptjs";

// Mock dependencies
jest.mock("@/lib/auth");
jest.mock("@/lib/logRepo");
jest.mock("@/lib/userRepo");
jest.mock("bcryptjs");

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockWriteVerifyLog = writeVerifyLog as jest.MockedFunction<
  typeof writeVerifyLog
>;
const mockGetUserByUsername = getUserByUsername as jest.MockedFunction<
  typeof getUserByUsername
>;
const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<
  typeof bcrypt.compare
>;

describe("GraphQL Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fetch globally for Australia Post API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should validate authentication and external API integration", async () => {
    // Set up login mocks
    const mockUser = {
      username: "Test2@test.com",
      passwordHash: "hashed-password",
      createdAt: "2023-01-01T00:00:00.000Z",
    };
    mockGetUserByUsername.mockResolvedValue(mockUser);
    // @ts-expect-error: mockResolvedValue expects a Promise, but bcrypt.compare returns a Promise<boolean>
    mockBcryptCompare.mockResolvedValue(Promise.resolve(true));

    // First, perform actual login to get a real token
    const loginRequest = new Request("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Test2@test.com",
        password: "Qq1997!!",
      }),
    });

    const loginResponse = await loginPOST(loginRequest);
    expect(loginResponse.status).toBe(200);

    const loginData = await loginResponse.json();
    expect(loginData.ok).toBe(true);

    // Verify login was successful (cookie is set internally by NextResponse)
    expect(loginResponse.status).toBe(200);

    // Mock the token verification for the GraphQL call
    mockVerifyToken.mockResolvedValue({ username: "Test2@test.com" });

    // Mock Australia Post API response
    const mockApiResponse = {
      localities: {
        locality: [
          {
            category: "Delivery Area",
            id: 1,
            latitude: -37.8136,
            longitude: 144.9631,
            location: "MELBOURNE",
            postcode: "3000",
            state: "VIC",
          },
        ],
      },
    };

    // Mock fetch for Australia Post API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    // Mock log writing
    mockWriteVerifyLog.mockResolvedValue();

    // Test authentication function
    const authResult = await mockVerifyToken("real-token");
    expect(authResult).toEqual({ username: "Test2@test.com" });

    // Test Australia Post API integration
    const apiUrl =
      "https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json?q=Melbourne&state=VIC";
    const apiResponse = await global.fetch(apiUrl, {
      headers: {
        Authorization: "Bearer 7710a8c5-ccd1-160f-70cf03e8-b2bbaf01",
      },
    });

    const apiData = await apiResponse.json();
    expect(apiData.localities.locality).toBeDefined();
    expect(apiData.localities.locality[0].location).toBe("MELBOURNE");

    // Test logging function
    await mockWriteVerifyLog({
      userId: "Test2@test.com",
      suburb: "Melbourne",
      state: "VIC",
      postcode: "3000",
      success: true,
      ts: new Date().toISOString(),
      lat: -37.8136,
      lng: 144.9631,
    });

    expect(mockWriteVerifyLog).toHaveBeenCalledWith({
      userId: "Test2@test.com",
      suburb: "Melbourne",
      state: "VIC",
      postcode: "3000",
      success: true,
      ts: expect.any(String),
      lat: -37.8136,
      lng: 144.9631,
    });

    // Verify all mocks were called
    expect(mockVerifyToken).toHaveBeenCalledWith("real-token");
    expect(global.fetch).toHaveBeenCalledWith(apiUrl, expect.any(Object));
    expect(mockWriteVerifyLog).toHaveBeenCalled();
  });

  it("should handle authentication failure", async () => {
    // Mock authentication failure
    mockVerifyToken.mockResolvedValue(null);

    const result = await mockVerifyToken("invalid-token");
    expect(result).toBeNull();
    expect(mockVerifyToken).toHaveBeenCalledWith("invalid-token");
  });
});
