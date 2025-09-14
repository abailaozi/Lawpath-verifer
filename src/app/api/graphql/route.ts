/**
 * GraphQL API Route for Address Verification
 *
 * Provides a GraphQL endpoint for validating Australian addresses using the Australia Post API.
 * Features authentication, comprehensive error handling, and detailed logging of verification attempts.
 *
 * @route POST /api/graphql
 * @requires Authentication via JWT token in cookies
 * @returns GraphQL response with validation results
 */

import { createYoga, createSchema } from "graphql-yoga";
import { NextRequest } from "next/server";
import { GraphQLError } from "graphql";
import { verifyToken } from "@/lib/auth";
import { writeVerifyLog } from "@/lib/logRepo";

// Force Node.js runtime for external API calls and file system access
export const runtime = "nodejs";

/**
 * GraphQL Schema Definition
 *
 * Defines the GraphQL schema for address verification API.
 * Provides a single query for validating Australian addresses with comprehensive result data.
 */
const typeDefs = `
  # Result of address validation operation
  type ValidationResult {
    success: Boolean!      # Whether the validation was successful
    message: String!       # Human-readable message describing the result
    latitude: Float        # Geographic latitude if validation successful
    longitude: Float       # Geographic longitude if validation successful
  }
  
  # Root query type for address verification
  type Query {
    # Validates an Australian address using postcode, suburb, and state
    validate(postcode: String!, suburb: String!, state: String!): ValidationResult!
  }
`;
/**
 * TypeScript Type Definitions for Australia Post API Integration
 *
 * These types handle the inconsistent response structure from the Australia Post API,
 * which returns different field names and structures depending on the query type.
 */

// Normalized locality data structure used internally
type AusPostLocality = {
  category: string; // Type of location (e.g., "Delivery Area")
  id: number; // Unique identifier
  latitude: number; // Geographic latitude
  location: string; // Location name
  longitude: number; // Geographic longitude
  postcode: string; // Postal code
  state: string; // State abbreviation
};

// Raw response item from Australia Post API (inconsistent structure)
type AusPostResponseItem = {
  category?: string; // Location category
  id?: number; // Unique identifier
  latitude?: number; // Geographic latitude
  longitude?: number; // Geographic longitude
  location?: string; // Location name (alternative to suburb)
  suburb?: string; // Suburb name (alternative to location)
  postcode?: string; // Postal code (alternative to postal_code)
  postal_code?: string; // Postal code (alternative to postcode)
  state?: string; // State abbreviation
  elevation?: number; // Elevation above sea level
  timezone?: string; // Timezone information
  region?: string; // Regional information
};

// Complete response structure from Australia Post API
type AusPostResponse = {
  localities?: {
    locality?: AusPostResponseItem | AusPostResponseItem[];
  };
  data?: {
    localities?: {
      locality?: AusPostResponseItem | AusPostResponseItem[];
    };
  };
};
const AUSPOST_BASE =
  "https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json";
const AUSPOST_TOKEN = "7710a8c5-ccd1-160f-70cf03e8-b2bbaf01";

async function fetchAusPost(
  q: string,
  state?: string
): Promise<AusPostLocality[]> {
  const url = new URL(AUSPOST_BASE);
  url.searchParams.set("q", q);
  if (state) {
    url.searchParams.set("state", state);
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AUSPOST_TOKEN}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch AusPost: ${res.statusText}`);
  const response = (await res.json()) as AusPostResponse;

  // Handle different response formats
  let localities: AusPostResponseItem[] = [];
  if (response.localities?.locality) {
    localities = Array.isArray(response.localities.locality)
      ? response.localities.locality
      : [response.localities.locality];
  } else if (response.data?.localities?.locality) {
    localities = Array.isArray(response.data.localities.locality)
      ? response.data.localities.locality
      : [response.data.localities.locality];
  }

  // Normalize the data structure
  return localities.map(
    (item: AusPostResponseItem): AusPostLocality => ({
      category: item.category || "",
      id: item.id || 0,
      latitude: item.latitude || 0,
      longitude: item.longitude || 0,
      location: item.location || item.suburb || "",
      postcode: item.postcode || item.postal_code || "",
      state: item.state || "",
    })
  );
}

const STATES = new Set<string>([
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "WA",
  "TAS",
  "ACT",
  "NT",
]);
const normalize = (s: string) => s.trim().toUpperCase();

async function getUserIdFromRequest(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token)
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHORIZED" },
    });
  const decoded = await verifyToken(token);
  if (!decoded)
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHORIZED" },
    });
  const userId = decoded.username;
  if (!userId)
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHORIZED" },
    });
  return userId.toLowerCase();
}

const resolvers = {
  Query: {
    validate: async (
      _: unknown,
      args: { postcode: string; suburb: string; state: string },
      context: { req: NextRequest }
    ) => {
      const userId = await getUserIdFromRequest(context.req);
      const postcode = args.postcode.trim();
      const suburbRaw = args.suburb.trim();
      const stateRaw = args.state.trim().toUpperCase();
      if (!/^\d{3,4}$/.test(postcode)) {
        throw new GraphQLError("Invalid postcode format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (suburbRaw.length < 2) {
        throw new GraphQLError("Invalid suburb", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (!STATES.has(stateRaw)) {
        throw new GraphQLError("Invalid state", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const suburb = normalize(suburbRaw);
      const state = normalize(stateRaw);
      try {
        const suburbList = await fetchAusPost(suburb, state);
        if (!suburbList.length) {
          const msg = `The suburb ${suburbRaw} does not exist in the state ${state}.`;
          await writeVerifyLog({
            userId,
            suburb: suburbRaw,
            state,
            postcode,
            success: false,
            error: msg,
            ts: new Date().toISOString(),
          });
          return { success: false, message: msg };
        }
        const postcodeList = await fetchAusPost(postcode, state);
        const match = postcodeList.find(
          (item) =>
            normalize(item.location) === suburb &&
            normalize(item.state) === state
        );
        if (!match) {
          const msg = `The postcode ${postcode} does not match the suburb ${suburbRaw}.`;
          await writeVerifyLog({
            userId,
            suburb: suburbRaw,
            state,
            postcode,
            success: false,
            error: msg,
            ts: new Date().toISOString(),
          });
          return { success: false, message: msg };
        }
        const okMsg = "The postcode, suburb, and state input are valid.";
        await writeVerifyLog({
          userId,
          suburb: suburbRaw,
          state,
          postcode,
          success: true,
          ts: new Date().toISOString(),
          lat: match.latitude,
          lng: match.longitude,
        });
        return {
          success: true,
          message: okMsg,
          latitude: match.latitude,
          longitude: match.longitude,
        };
      } catch (error) {
        const msg =
          error instanceof Error && error.message
            ? error.message
            : "Validation error";
        await writeVerifyLog({
          userId,
          suburb: suburbRaw,
          state,
          postcode,
          success: false,
          error: msg,
          ts: new Date().toISOString(),
        });
        return { success: false, message: msg };
      }
    },
  },
};

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  context: ({ request }) => ({ req: request }),
});

export { yoga as GET, yoga as POST };
