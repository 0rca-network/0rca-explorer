import algosdk from "algosdk";
import { AlgorandClient } from '@algorandfoundation/algokit-utils';

// ===== CONFIG =====
const ALGOD_URL = process.env.NEXT_PUBLIC_ALGOD_URL || "https://testnet-api.algonode.cloud";
const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "https://testnet-idx.algonode.cloud";
const ALGOD_TOKEN = process.env.NEXT_PUBLIC_ALGOD_TOKEN || "";
const INDEXER_TOKEN = process.env.NEXT_PUBLIC_INDEXER_TOKEN || "";
const ALGOD_PORT = process.env.NEXT_PUBLIC_ALGOD_PORT || "";
const INDEXER_PORT = process.env.NEXT_PUBLIC_INDEXER_PORT || "";

const MAIN_APP_ID = 749655317;
const LOGGING_APP_ID = 749653154;
const PAGE_LIMIT = 18;

// ===== HELPERS =====
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, ALGOD_PORT);
const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_URL, INDEXER_PORT);

const algorand = AlgorandClient.testNet();

export interface AgentData {
  id: string;
  name: string;
  creatorName: string;
  description: string;
  createdAt: string;
  status: string;
  address: string;
}

// 1️⃣ Fetch bnVtYmVy (number of agents)
export async function fetchNumberOfAgents(): Promise<number> {
  try {
    const app = await algodClient.getApplicationByID(MAIN_APP_ID).do();
    // Fix: Cast to any to avoid type errors with different SDK versions
    const params = app.params as any;
    const globalState = params.globalState || params["global-state"] || [];

    for (const state of globalState) {
      const keyBase64 = state.key;
      const key = Buffer.from(keyBase64, "base64").toString();
      if (key === "bnVtYmVy") {
        return Number(state.value.uint);
      }
    }
    return 0;
  } catch (error) {
    console.error("Error fetching number of agents:", error);
    return 0;
  }
}

// 2️⃣ Fetch Agents from Boxes
export async function fetchAgents(): Promise<AgentData[]> {
  try {
    const appId = BigInt(MAIN_APP_ID);

    // Get box names
    const boxNames = await algorand.app.getBoxNames(appId);

    const agents: AgentData[] = [];

    // Define ABI Type: (string,string,uint64,uint64,uint64,string)
    // [name, details, fixedPricing, createdAt, appID, creatorName]
    const agentAbiType = algosdk.ABIType.from("(string,string,uint64,uint64,uint64,string)");

    for (const box of boxNames) {
      try {
        // Fix: Cast box to any to handle type inference issues
        const boxAny = box as any;
        let nameRaw: Uint8Array;

        if (boxAny.nameRaw) {
          nameRaw = boxAny.nameRaw;
        } else if (boxAny.name && boxAny.name.nameRaw) {
          nameRaw = boxAny.name.nameRaw;
        } else {
          // Fallback
          nameRaw = boxAny.name || new Uint8Array();
        }

        const content = await algorand.app.getBoxValue(appId, nameRaw);

        // Decode content using ABI
        const decoded = agentAbiType.decode(content) as any;
        // decoded is [name, details, fixedPricing, createdAt, appID, creatorName]

        const name = decoded[0];
        const details = decoded[1]; // URL
        const createdAt = Number(decoded[3]); // uint64 to number
        const agentAppId = decoded[4].toString();
        const creatorName = decoded[5];

        // Use the agentAppId as the ID
        const id = agentAppId;

        agents.push({
          id: id,
          name: name,
          creatorName: creatorName,
          description: details,
          createdAt: new Date(createdAt * 1000).toISOString(),
          status: "active",
          address: algosdk.getApplicationAddress(BigInt(agentAppId))
        });

      } catch (e) {
        console.warn(`Failed to process box:`, e);
      }
    }

    return agents;
  } catch (error) {
    console.error("Error fetching agents from boxes:", error);
    return [];
  }
}

// 3️⃣ Fetch Agent Details (Global State)
export async function fetchAgentDetails(appId: number) {
  try {
    const app = await algodClient.getApplicationByID(appId).do();
    const params = app.params as any;
    const globalState = params.globalState || params["global-state"] || [];

    const details: Record<string, any> = {};
    for (const state of globalState) {
      const key = Buffer.from(state.key, "base64").toString();
      const value = state.value.uint !== undefined ? Number(state.value.uint) : state.value.bytes;
      details[key] = value;
    }

    return details;
  } catch (error) {
    console.error(`Error fetching agent details for ${appId}:`, error);
    return {};
  }
}

export interface TaskData {
  id: string;
  success: boolean;
  timestamp: number;
  details: string;
  executor: string;
}

// 4️⃣ Fetch Agent Tasks (Boxes)
export async function fetchAgentTasks(appId: number): Promise<TaskData[]> {
  try {
    const appIdBigInt = BigInt(appId);
    const boxNames = await algorand.app.getBoxNames(appIdBigInt);
    const tasks: TaskData[] = [];

    // Task Struct: (uint64,bool,uint64,string,address)
    const taskAbiType = algosdk.ABIType.from("(uint64,bool,uint64,string,address)");

    for (const box of boxNames) {
      try {
        const boxAny = box as any;
        let nameRaw: Uint8Array;
        if (boxAny.nameRaw) nameRaw = boxAny.nameRaw;
        else if (boxAny.name && boxAny.name.nameRaw) nameRaw = boxAny.name.nameRaw;
        else nameRaw = boxAny.name || new Uint8Array();

        const content = await algorand.app.getBoxValue(appIdBigInt, nameRaw);

        // Decode as Task
        const decoded = taskAbiType.decode(content) as any;

        tasks.push({
          id: decoded[0].toString(),
          success: decoded[1],
          timestamp: Number(decoded[2]),
          details: decoded[3],
          executor: decoded[4]
        });
      } catch (e) {
        // Ignore boxes that don't match Task struct
      }
    }

    return tasks.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error(`Error fetching tasks for ${appId}:`, error);
    return [];
  }
}

// 5️⃣ Fetch logging contract transactions
export async function fetchLoggingTransactions(agents: string[], nextToken?: string) {
  try {
    let query = indexerClient.searchForTransactions()
      .applicationID(LOGGING_APP_ID)
      .limit(PAGE_LIMIT);

    if (nextToken) {
      query = query.nextToken(nextToken);
    }

    const res = await query.do();
    // Fix: Cast res to any to access next-token if type definition is missing it
    const resAny = res as any;

    const txns = (res.transactions || [])
      .map((tx: any) => ({
        id: tx.id,
        sender: tx.sender,
        round: Number(tx["confirmed-round"]),
        timestamp: Number(tx["round-time"])
      }));

    return {
      transactions: txns,
      nextToken: resAny["next-token"] || resAny.nextToken
    };
  } catch (error) {
    console.error("Error fetching logging transactions:", error);
    return { transactions: [], nextToken: null };
  }
}
