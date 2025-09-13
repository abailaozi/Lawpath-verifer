const { Client } = require("@elastic/elasticsearch");
require("dotenv").config({ path: ".env.local" });

const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: { apiKey: process.env.ELASTIC_API_KEY },
  serverMode: "serverless",
});

async function initIndex() {
  try {
    console.log("Creating Elasticsearch index...");

    // 检查索引是否存在
    const indexExists = await client.indices.exists({
      index: process.env.USER_INDEX,
    });

    if (indexExists) {
      console.log(`✅ Index ${process.env.USER_INDEX} already exists`);
      return;
    }

    // 创建索引
    await client.indices.create({
      index: process.env.USER_INDEX,
      body: {
        mappings: {
          properties: {
            username: {
              type: "keyword",
            },
            passwordHash: {
              type: "keyword",
            },
            createdAt: {
              type: "date",
            },
          },
        },
      },
    });

    console.log(`✅ Index ${process.env.USER_INDEX} created successfully`);
  } catch (error) {
    console.error("❌ Error creating index:", error.message);
  }
}

initIndex();
