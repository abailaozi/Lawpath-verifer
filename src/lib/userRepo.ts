import { client } from "./elastic";
const USER_INDEX = process.env.USER_INDEX!;

export type User = {
  username: string;
  passwordHash: string;
  createdAt: string;
};
export async function getUserByUsername(
  username: string
): Promise<User | null> {
  const res = await client.search({
    index: USER_INDEX,
    size: 1,
    query: { term: { username } },
  });
  if (res.hits.hits.length === 0) {
    return null;
  }
  return res.hits.hits[0]._source as User;
}
export async function createUser(user: {
  username: string;
  passwordHash: string;
}) {
  await client.index({
    index: USER_INDEX,
    document: { ...user, createdAt: new Date().toISOString() },
    refresh: "wait_for",
  });
}
