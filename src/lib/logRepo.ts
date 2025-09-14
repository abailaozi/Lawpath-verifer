import { client } from "./elastic";

const LOGS_INDEX = process.env.LOGS_INDEX!;

export type VerifyLog = {
  userId: string;
  postcode: string;
  suburb: string;
  state: string;
  success: boolean;
  error?: string;
  ts: string;         
  lat?: number;       
  lng?: number;       
};

export async function writeVerifyLog(log: VerifyLog) {
  try {
    await client.index({
      index: LOGS_INDEX,
      document: log,
      refresh: "wait_for", 
    });
  } catch (e) {
    console.error("Failed to write verify log:", e);
  }
}