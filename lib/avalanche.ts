import { createPublicClient, http, defineChain, parseAbiItem, fromHex, Chain, Log, decodeEventLog } from 'viem';

// Avalanche Subnet Definition
const avalancheSubnetChain = defineChain({
    id: 43112,
    name: 'Avalanche Subnet',
    network: 'avalanche-subnet',
    nativeCurrency: { decimals: 6, name: 'USDT', symbol: 'USDT' },
    rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || 'http://127.0.0.1:8545'] },
        public: { http: [process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || 'http://127.0.0.1:8545'] },
    },
    blockExplorers: {
        default: { name: 'AvaScan', url: 'https://avascan.info' },
    },
    testnet: true,
});

const ORCA_ABI = [
    parseAbiItem('event BountyCreated(uint256 indexed bountyId, address issuer, uint256 amount, string taskData)'),
    parseAbiItem('event BountySettled(uint256 indexed bountyId, address fulfilledBy, uint256 amount)')
];

const clients: Record<number, any> = {};

export function getPublicClient(chainId: number = 43112) {
    if (clients[chainId]) return clients[chainId];
    const client = createPublicClient({ chain: avalancheSubnetChain, transport: http() });
    clients[chainId] = client;
    return client;
}

export function getContractAddresses(chainId: number = 43112) {
    return {
        identityRegistry: "0x0000000000000000000000000000000000000000",
        reputationRegistry: "0x0000000000000000000000000000000000000000",
        validationRegistry: "0x0000000000000000000000000000000000000000",
        escrow: process.env.NEXT_PUBLIC_AVALANCHE_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000",
        usdt: process.env.NEXT_PUBLIC_AVALANCHE_USDT_ADDRESS || "0x0000000000000000000000000000000000000000"
    } as any;
}

export interface AgentData {
    id: string;
    name: string;
    creatorName: string;
    description: string;
    createdAt: string;
    status: string;
    address: string;
    reputation: { count: number; score: number };
    validation: { count: number; score: number };
}

// Mocked for the demo
export async function fetchAgents(chainId: number = 43112): Promise<AgentData[]> {
    return [
        {
            id: "1",
            name: "Agent A (Delegator)",
            creatorName: "0rca Network",
            description: "Task Delegator on Avalanche Subnet",
            createdAt: new Date().toISOString(),
            status: "active",
            address: "0x...",
            reputation: { count: 10, score: 95 },
            validation: { count: 5, score: 100 }
        },
        {
            id: "2",
            name: "Agent B (Worker)",
            creatorName: "0rca Network",
            description: "Task Worker on Avalanche Subnet",
            createdAt: new Date().toISOString(),
            status: "active",
            address: "0x...",
            reputation: { count: 25, score: 98 },
            validation: { count: 12, score: 100 }
        }
    ];
}

export async function fetchTransactions(chainId: number = 43112) {
    try {
        const client = getPublicClient(chainId);
        const addresses = getContractAddresses(chainId);
        const targetAddresses = [
            addresses.escrow
        ].filter(addr => addr && addr !== '0x0000000000000000000000000000000000000000').map(a => String(a).toLowerCase());

        const currentBlock = await client.getBlockNumber();
        const transactions: any[] = [];
        const seenHashes = new Set<string>();

        // Fetch Logs for specific bounty events
        try {
            const logs = await client.getLogs({
                address: targetAddresses as `0x${string}`[],
                fromBlock: currentBlock - BigInt(5000),
                toBlock: currentBlock
            });

            for (const log of logs) {
                if (!seenHashes.has(log.transactionHash)) {
                    const [block, tx] = await Promise.all([
                        client.getBlock({ blockNumber: log.blockNumber }),
                        client.getTransaction({ hash: log.transactionHash })
                    ]);

                    let type = "Bounty Event";
                    let metadata: any = {};

                    try {
                        const decoded = decodeEventLog({
                            abi: ORCA_ABI,
                            data: log.data,
                            topics: log.topics,
                        });

                        if (decoded.eventName === 'BountyCreated') {
                            type = "Bounty Created";
                            const args = decoded.args as any;
                            metadata.amount = (Number(args.amount) / 10 ** 6).toString();
                            metadata.bountyId = args.bountyId.toString();

                            // Parse x402 JSON Payload
                            try {
                                const payload = JSON.parse(args.taskData);
                                metadata.protocol = payload.protocol;
                                metadata.requester_platform = payload.requester_platform;
                                metadata.task_type = payload.task_type;
                            } catch (e) {
                                metadata.taskData = args.taskData;
                            }
                        } else if (decoded.eventName === 'BountySettled') {
                            type = "Bounty Settled";
                            const args = decoded.args as any;
                            metadata.amount = (Number(args.amount) / 10 ** 6).toString();
                            metadata.bountyId = args.bountyId.toString();
                            metadata.fulfilledBy = args.fulfilledBy;
                        }
                    } catch (e) {
                        console.error("Decode error:", e);
                    }

                    transactions.push({
                        id: log.transactionHash,
                        sender: tx.from,
                        type: type,
                        round: Number(log.blockNumber),
                        timestamp: Number(block.timestamp),
                        metadata: metadata
                    });
                    seenHashes.add(log.transactionHash);
                }
            }
        } catch (e) {
            console.error("Log fetch error:", e);
        }

        return transactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

export async function fetchAgentDetails(id: string, chainId: number = 43112) {
    const agents = await fetchAgents(chainId);
    return agents.find(a => a.id === id) || null;
}

