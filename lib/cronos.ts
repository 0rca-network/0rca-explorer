import { createPublicClient, http, defineChain, parseAbiItem, fromHex, Chain, Log } from 'viem';
import contracts from './contracts.json';

// Chain Definitions
const cronosTestnetChain = defineChain({
    id: 338,
    name: 'Cronos Testnet',
    network: 'cronos-net',
    nativeCurrency: { decimals: 18, name: 'TCRO', symbol: 'TCRO' },
    rpcUrls: {
        default: { http: ['https://evm-t3.cronos.org'] },
        public: { http: ['https://evm-t3.cronos.org'] },
    },
    blockExplorers: {
        default: { name: 'Cronos Explorer', url: 'https://explorer.cronos.org/testnet' },
    },
    testnet: true,
});

const ganacheChain = defineChain({
    id: 1337,
    name: 'Localnet',
    network: 'ganache',
    nativeCurrency: { decimals: 18, name: 'ETH', symbol: 'ETH' },
    rpcUrls: {
        default: { http: ['http://127.0.0.1:7545'] },
        public: { http: ['http://127.0.0.1:7545'] },
    },
    blockExplorers: {
        default: { name: 'Local Explorer', url: 'http://127.0.0.1:7545' },
    },
    testnet: true,
});

const clients: Record<number, any> = {};

export function getPublicClient(chainId: number = 338) {
    if (clients[chainId]) return clients[chainId];
    let chain: Chain = cronosTestnetChain;
    if (chainId === 1337 || chainId === 5777) chain = ganacheChain;
    const client = createPublicClient({ chain, transport: http() });
    clients[chainId] = client;
    return client;
}

export function getContractAddresses(chainId: number = 338) {
    if (chainId === 1337 || chainId === 5777) return contracts.ganache;
    return contracts.cronosTestnet;
}

const IDENTITY_ABI = [
    "event Registered(uint256 indexed agentId, string tokenURI, address indexed owner)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function getMetadata(uint256 agentId, string key) view returns (bytes)"
];

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

export async function fetchAgents(chainId: number = 338): Promise<AgentData[]> {
    try {
        const client = getPublicClient(chainId);
        const addresses = getContractAddresses(chainId);
        const agents: AgentData[] = [];

        // Fetch IDs 0 to 19 directly from contract state
        const idsToTry = Array.from({ length: 20 }, (_, i) => i);

        const results = await Promise.all(idsToTry.map(async (i) => {
            const id = i.toString();
            try {
                const owner = await client.readContract({
                    address: addresses.identityRegistry as `0x${string}`,
                    abi: [parseAbiItem('function ownerOf(uint256 tokenId) view returns (address)')],
                    functionName: 'ownerOf',
                    args: [BigInt(id)]
                }) as string;

                if (!owner || owner === '0x0000000000000000000000000000000000000000') return null;

                let name = `Agent #${id}`;
                let description = "";

                try {
                    const nameBytes = await client.readContract({
                        address: addresses.identityRegistry as `0x${string}`,
                        abi: IDENTITY_ABI,
                        functionName: 'getMetadata',
                        args: [BigInt(id), 'name']
                    }) as `0x${string}`;
                    if (nameBytes && nameBytes !== '0x') {
                        const decoded = fromHex(nameBytes, 'string');
                        if (decoded) name = decoded;
                    }

                    const descBytes = await client.readContract({
                        address: addresses.identityRegistry as `0x${string}`,
                        abi: IDENTITY_ABI,
                        functionName: 'getMetadata',
                        args: [BigInt(id), 'description']
                    }) as `0x${string}`;
                    if (descBytes && descBytes !== '0x') {
                        const decoded = fromHex(descBytes, 'string');
                        if (decoded) description = decoded;
                    }
                } catch (e) { }

                return {
                    id, name, creatorName: 'Project 0rca', description,
                    createdAt: new Date().toISOString(), status: 'active',
                    address: owner,
                    reputation: { count: 0, score: 0 },
                    validation: { count: 0, score: 0 }
                };
            } catch (e) { return null; }
        }));

        return results.filter((a): a is AgentData => a !== null);
    } catch (error) {
        console.error("Error fetching agents:", error);
        return [];
    }
}

export async function fetchTransactions(chainId: number = 338) {
    try {
        const client = getPublicClient(chainId);
        const addresses = getContractAddresses(chainId);
        const targetAddresses = [
            addresses.identityRegistry,
            addresses.reputationRegistry,
            addresses.validationRegistry
        ].filter(addr => addr && addr !== '0x0000000000000000000000000000000000000000').map(a => a.toLowerCase());

        const currentBlock = await client.getBlockNumber();
        const transactions: any[] = [];
        const seenHashes = new Set<string>();

        // Phase 1: Scan last 50 blocks directly for transactions (very fast, covers calls)
        const recentBlocksToScan = 50;
        const blockPromises = [];
        for (let i = 0; i < recentBlocksToScan; i++) {
            blockPromises.push(client.getBlock({
                blockNumber: currentBlock - BigInt(i),
                includeTransactions: true
            }));
        }

        const blocks = await Promise.all(blockPromises);
        for (const block of blocks) {
            if (!block || !block.transactions) continue;
            for (const tx of block.transactions as any[]) {
                if (tx.to && targetAddresses.includes(tx.to.toLowerCase())) {
                    if (!seenHashes.has(tx.hash)) {
                        let type = "Direct Call";
                        if (tx.to.toLowerCase() === addresses.identityRegistry.toLowerCase()) type = "Identity Registry";
                        else if (tx.to.toLowerCase() === addresses.reputationRegistry.toLowerCase()) type = "Reputation Registry";
                        else if (tx.to.toLowerCase() === addresses.validationRegistry.toLowerCase()) type = "Validation Registry";

                        transactions.push({
                            id: tx.hash,
                            sender: tx.from,
                            type: type,
                            round: Number(block.number),
                            timestamp: Number(block.timestamp)
                        });
                        seenHashes.add(tx.hash);
                    }
                }
            }
        }

        // Phase 2: Use getLogs for older activity (in one larger chunk if possible)
        // We'll try the last 5000 blocks which is standard for most RPCs
        try {
            const logs = await client.getLogs({
                address: targetAddresses as `0x${string}`[],
                fromBlock: currentBlock - BigInt(5000),
                toBlock: currentBlock
            });

            for (const log of logs) {
                if (!seenHashes.has(log.transactionHash)) {
                    // Fetch details for logs not found in Phase 1
                    const [block, tx] = await Promise.all([
                        client.getBlock({ blockNumber: log.blockNumber }),
                        client.getTransaction({ hash: log.transactionHash })
                    ]);

                    let type = "Registry Event";
                    if (log.address.toLowerCase() === addresses.identityRegistry.toLowerCase()) type = "Identity Registry";
                    else if (log.address.toLowerCase() === addresses.reputationRegistry.toLowerCase()) type = "Reputation Registry";
                    else if (log.address.toLowerCase() === addresses.validationRegistry.toLowerCase()) type = "Validation Registry";

                    transactions.push({
                        id: log.transactionHash,
                        sender: tx.from,
                        type: type,
                        round: Number(log.blockNumber),
                        timestamp: Number(block.timestamp)
                    });
                    seenHashes.add(log.transactionHash);
                }
            }
        } catch (e) {
            console.error("Historical log fetch error (skipping):", e);
        }

        return transactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

export async function fetchAgentDetails(id: string, chainId: number = 338) {
    const agents = await fetchAgents(chainId);
    return agents.find(a => a.id === id) || null;
}
