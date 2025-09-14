import { createYoga, createSchema } from "graphql-yoga";
import { NextRequest } from "next/server";
import { GraphQLError } from "graphql";
import * as jwt from "jsonwebtoken";
import { writeVerifyLog } from "@/lib/logRepo";

export const runtime = "nodejs";

const typeDefs = `type ValidationResult{
success: Boolean!
message: String!
latitude: Float
longitude: Float
}
type Query{
validate(postcode: String!,suburb: String!,state: String!): ValidationResult!
}
`;
type AusPostLocality = {
  category: string;
  id: number;
  latitude: number;
  location: string;
  longitude: number;
  postcode: string;
  state: string;
};
const AUSPOST_BASE =
  "https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json";
const AUSPOST_TOKEN = "7710a8c5-ccd1-160f-70cf03e8-b2bbaf01";

async function fetchAusPost(q: string, state?: string) {
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
  const data = (await res.json()) as AusPostLocality[];
  return data;
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

function getUserIdFromRequest(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token)
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHORIZED" },
    });
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    username: string;
  };
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
      const userId = getUserIdFromRequest(context.req);
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
