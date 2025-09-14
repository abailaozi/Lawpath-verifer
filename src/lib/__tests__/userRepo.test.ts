import { getUserByUsername, createUser } from "../userRepo";
import { client } from "../elastic";
import {
  MockUser,
  MockElasticsearchResponse,
  MockElasticsearchIndexResponse,
} from "../../__tests__/types";

// Mock the elastic client
jest.mock("../elastic", () => ({
  client: {
    search: jest.fn(),
    index: jest.fn(),
  },
}));

const mockClient = client as jest.Mocked<typeof client>;

describe("User Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserByUsername", () => {
    it("should return user when found", async () => {
      const mockUser: MockUser = {
        username: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: "2023-01-01T00:00:00.000Z",
      };

      const mockResponse: MockElasticsearchResponse<MockUser> = {
        hits: {
          hits: [
            {
              _source: mockUser,
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(
        mockResponse as unknown as Awaited<ReturnType<typeof mockClient.search>>
      );

      const result = await getUserByUsername("test@example.com");

      expect(result).toEqual(mockUser);
      expect(mockClient.search).toHaveBeenCalledWith({
        index: "test-users",
        size: 1,
        query: { term: { username: "test@example.com" } },
      });
    });

    it("should return null when user not found", async () => {
      const mockResponse: MockElasticsearchResponse = {
        hits: {
          hits: [],
        },
      };

      mockClient.search.mockResolvedValue(
        mockResponse as unknown as Awaited<ReturnType<typeof mockClient.search>>
      );

      const result = await getUserByUsername("nonexistent@example.com");

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      mockClient.search.mockRejectedValue(new Error("Elasticsearch error"));

      await expect(getUserByUsername("test@example.com")).rejects.toThrow(
        "Elasticsearch error"
      );
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const userData = {
        username: "test@example.com",
        passwordHash: "hashed-password",
      };

      const mockResponse: MockElasticsearchIndexResponse = {
        _id: "test-id",
        _index: "test-users",
        _version: 1,
        result: "created",
      };

      mockClient.index.mockResolvedValue(
        mockResponse as unknown as Awaited<ReturnType<typeof mockClient.index>>
      );

      await createUser(userData);

      expect(mockClient.index).toHaveBeenCalledWith({
        index: "test-users",
        document: {
          ...userData,
          createdAt: expect.any(String),
        },
        refresh: "wait_for",
      });
    });

    it("should handle errors gracefully", async () => {
      const userData = {
        username: "test@example.com",
        passwordHash: "hashed-password",
      };

      mockClient.index.mockRejectedValue(new Error("Elasticsearch error"));

      await expect(createUser(userData)).rejects.toThrow("Elasticsearch error");
    });
  });
});
