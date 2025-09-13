import { Client } from "@elastic/elasticsearch";

export const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: { apiKey: process.env.ELASTIC_API_KEY as string },
  serverMode: "serverless",
});
export async function ensureIndices() {
  if (!(await client.indices.exists({ index: process.env.USER_INDEX! }))) {
    await client.indices.create({
      index: process.env.USER_INDEX!,
      mappings: {
        properties: {
          username: { type: "keyword" },
          passwordHash: { type: "keyword" },
          createdAt: { type: "date" },
        },
      },
    });
  }

  if (!(await client.indices.exists({ index: process.env.LOGS_INDEX! }))) {
    await client.indices.create({
      index: process.env.LOGS_INDEX!,
      mappings: {
        properties: {
          userId: { type: "keyword" },
          suburb: { type: "keyword" },
          state: { type: "keyword" },
          postcode: { type: "keyword" },
          success: { type: "boolean" },
          error: { type: "text" },
          ts: { type: "date" },
        },
      },
    });
  }
}
