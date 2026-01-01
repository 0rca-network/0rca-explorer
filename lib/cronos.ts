import { createPublicClient, http, defineChain, parseAbiItem } from 'viem';
import contracts from './contracts.json';

// Chain Definitions
const cronosTestnetChain = defineChain({
    id: 338,
    name: 'Cronos Testnet',
    network: 'cronos-testnet',
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

// Client Cache
const clients: Record<number, any> = {};

export function getPublicClient(chainId: number = 338) {
    if (clients[chainId]) return clients[chainId];

    let chain = cronosTestnetChain;
    if (chainId === 1337 || chainId === 5777) chain = ganacheChain;

    const client = createPublicClient({
        chain,
        transport: http(),
    });
    clients[chainId] = client;
    return client;
}

export function getContractAddresses(chainId: number = 338) {
    if (chainId === 1337 || chainId === 5777) {
        return contracts.ganache;
    }
    return contracts.cronosTestnet;
}

// Default export for backward compatibility if needed, but prefer specific calls
export const publicClient = getPublicClient();
export const IDENTITY_REGISTRY_ADDRESS = contracts.cronosTestnet.identityRegistry;
export const REPUTATION_REGISTRY_ADDRESS = contracts.cronosTestnet.reputationRegistry;
export const VALIDATION_REGISTRY_ADDRESS = contracts.cronosTestnet.validationRegistry;

// ABIs
const IDENTITY_ABI = [
    "event Registered(uint256 indexed agentId, string tokenURI, address indexed owner)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function getMetadata(uint256 agentId, string key) view returns (bytes)"
];

const REPUTATION_ABI = [
    "function getSummary(uint256 agentId, address[] clientAddresses, bytes32 tag1, bytes32 tag2) view returns (uint64 count, uint8 averageScore)",
    "event NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint8 score, bytes32 indexed tag1, bytes32 tag2, string feedbackUri, bytes32 feedbackHash)"
];

const VALIDATION_ABI = [
    "function getSummary(uint256 agentId, address[] validatorAddresses, bytes32 tag) view returns (uint64 count, uint8 avgResponse)",
    "event ValidationResponse(address indexed validatorAddress, uint256 indexed agentId, bytes32 indexed requestHash, uint8 response, string responseUri, bytes32 responseHash, bytes32 tag)"
];

export interface AgentData {
    id: string;
    name: string;
    creatorName: string;
    description: string;
    createdAt: string;
    status: string; // active/inactive
    address: string; // owner
    reputation: {
        count: number;
        score: number;
    };
    validation: {
        count: number;
        score: number;
    };
}

export async function fetchAgents(chainId: number = 338): Promise<AgentData[]> {
    try {
        const client = getPublicClient(chainId);
        const addresses = getContractAddresses(chainId);

        // 1. Get all Registered events
        const logs = await client.getLogs({
            address: addresses.identityRegistry as `0x${string}`,
            event: parseAbiItem('event Registered(uint256 indexed agentId, string tokenURI, address indexed owner)'),
            fromBlock: 'earliest'
        });

        const agents: AgentData[] = [];

        for (const log of logs) {
            if (!log.args.agentId) continue;

            const id = log.args.agentId.toString();
            const owner = log.args.owner || '0x0000000000000000000000000000000000000000';
            const tokenUri = log.args.tokenURI || '';

            let name = `Agent #${id}`;
            let description = tokenUri;
            let creatorName = 'Unknown';

            // Fetch Reputation Summary
            let reputation = { count: 0, score: 0 };
            try {
                const [count, score] = await client.readContract({
                    address: addresses.reputationRegistry as `0x${string}`,
                    abi: [parseAbiItem('function getSummary(uint256 agentId, address[] clientAddresses, bytes32 tag1, bytes32 tag2) view returns (uint64 count, uint8 averageScore)')],
                    functionName: 'getSummary',
                    args: [BigInt(log.args.agentId), [], '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000000']
                }) as [bigint, number];
                reputation = { count: Number(count), score: Number(score) };
            } catch (e) {
                // console.warn(`Failed to fetch reputation for agent ${id}`, e);
            }

            // Fetch Validation Summary
            let validation = { count: 0, score: 0 };
            try {
                const [count, score] = await client.readContract({
                    address: addresses.validationRegistry as `0x${string}`,
                    abi: [parseAbiItem('function getSummary(uint256 agentId, address[] validatorAddresses, bytes32 tag) view returns (uint64 count, uint8 avgResponse)')],
                    functionName: 'getSummary',
                    args: [BigInt(log.args.agentId), [], '0x0000000000000000000000000000000000000000000000000000000000000000']
                }) as [bigint, number];
                validation = { count: Number(count), score: Number(score) };
            } catch (e) {
                // console.warn(`Failed to fetch validation for agent ${id}`, e);
            }

            agents.push({
                id,
                name,
                creatorName,
                description,
                createdAt: new Date().toISOString(),
                status: 'active',
                address: owner,
                reputation,
                validation
            });
        }

        return agents.reverse();
    } catch (error) {
        console.error("Error fetching Cronos agents:", error);
        return [];
    }
}

export async function fetchTransactions(chainId: number = 338) {
    try {
        const client = getPublicClient(chainId);
        const addresses = getContractAddresses(chainId);

        const [identityLogs, reputationLogs, validationLogs] = await Promise.all([
            client.getLogs({
                address: addresses.identityRegistry as `0x${string}`,
                fromBlock: 'earliest',
                toBlock: 'latest'
            }),
            client.getLogs({
                address: addresses.reputationRegistry as `0x${string}`,
                fromBlock: 'earliest',
                toBlock: 'latest'
            }),
            client.getLogs({
                address: addresses.validationRegistry as `0x${string}`,
                fromBlock: 'earliest',
                toBlock: 'latest'
            })
        ]);

        // Normalize
        const txs = [
            ...identityLogs.map(l => ({ hash: l.transactionHash, type: 'Identity', blockNumber: l.blockNumber })),
            ...reputationLogs.map(l => ({ hash: l.transactionHash, type: 'Reputation', blockNumber: l.blockNumber })),
            ...validationLogs.map(l => ({ hash: l.transactionHash, type: 'Validation', blockNumber: l.blockNumber }))
        ].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

        return txs.map(t => ({
            id: t.hash,
            sender: '0x...', // We don't have sender in logs easily without fetching tx
            round: Number(t.blockNumber),
            timestamp: Date.now() // Mock timestamp or fetch block
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

export async function fetchAgentDetails(id: string, chainId: number = 338) {
    // Re-use fetch logic or optimize
    const agents = await fetchAgents(chainId);
    return agents.find(a => a.id === id) || null;
}
