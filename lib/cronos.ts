import { createPublicClient, http, defineChain, parseAbiItem } from 'viem';

// Cronos Testnet Definition
const cronosTestnet = defineChain({
    id: 338,
    name: 'Cronos Testnet',
    network: 'cronos-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'TCRO',
        symbol: 'TCRO',
    },
    rpcUrls: {
        default: { http: ['https://evm-t3.cronos.org'] },
        public: { http: ['https://evm-t3.cronos.org'] },
    },
    blockExplorers: {
        default: { name: 'Cronos Explorer', url: 'https://explorer.cronos.org/testnet' },
    },
    testnet: true,
});

export const publicClient = createPublicClient({
    chain: cronosTestnet,
    transport: http(),
});

// Contract Addresses
export const IDENTITY_REGISTRY_ADDRESS = '0xB159E0c8093081712c92e274DbFEa5A97A80cA30';
export const REPUTATION_REGISTRY_ADDRESS = '0x38E9cDB0eBc128bEA55c36C03D5532697669132d';
export const VALIDATION_REGISTRY_ADDRESS = '0x386fd4Fa2F27E528CF2D11C6d4b0A4dceD283E0E';

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

export async function fetchAgents(): Promise<AgentData[]> {
    try {
        // 1. Get all Registered events
        const logs = await publicClient.getLogs({
            address: IDENTITY_REGISTRY_ADDRESS,
            event: parseAbiItem('event Registered(uint256 indexed agentId, string tokenURI, address indexed owner)'),
            fromBlock: 'earliest'
        });

        const agents: AgentData[] = [];

        for (const log of logs) {
            if (!log.args.agentId) continue;

            const id = log.args.agentId.toString();
            const owner = log.args.owner || '0x0000000000000000000000000000000000000000';
            const tokenUri = log.args.tokenURI || '';

            // Fetch metadata from URI (mocking for simplicity if URI is just a string, else fetch)
            // For demo, we parse URI if it's JSON or assume it's description
            let name = `Agent #${id}`;
            let description = tokenUri;
            let creatorName = 'Unknown';

            // Fetch Reputation Summary
            let reputation = { count: 0, score: 0 };
            try {
                const [count, score] = await publicClient.readContract({
                    address: REPUTATION_REGISTRY_ADDRESS,
                    abi: [parseAbiItem('function getSummary(uint256 agentId, address[] clientAddresses, bytes32 tag1, bytes32 tag2) view returns (uint64 count, uint8 averageScore)')],
                    functionName: 'getSummary',
                    args: [BigInt(log.args.agentId), [], '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000000']
                });
                reputation = { count: Number(count), score: Number(score) };
            } catch (e) {
                console.warn(`Failed to fetch reputation for agent ${id}`, e);
            }

            // Fetch Validation Summary
            let validation = { count: 0, score: 0 };
            try {
                const [count, score] = await publicClient.readContract({
                    address: VALIDATION_REGISTRY_ADDRESS,
                    abi: [parseAbiItem('function getSummary(uint256 agentId, address[] validatorAddresses, bytes32 tag) view returns (uint64 count, uint8 avgResponse)')],
                    functionName: 'getSummary',
                    args: [BigInt(log.args.agentId), [], '0x0000000000000000000000000000000000000000000000000000000000000000']
                });
                validation = { count: Number(count), score: Number(score) };
            } catch (e) {
                console.warn(`Failed to fetch validation for agent ${id}`, e);
            }

            agents.push({
                id,
                name,
                creatorName,
                description,
                createdAt: new Date().toISOString(), // Block timestamp would be better but requires more calls
                status: 'active',
                address: owner,
                reputation,
                validation
            });
        }

        return agents.reverse(); // Newest first
    } catch (error) {
        console.error("Error fetching Cronos agents:", error);
        return [];
    }
}

export async function fetchTransactions() {
    try {
        const [identityLogs, reputationLogs, validationLogs] = await Promise.all([
            publicClient.getLogs({
                address: IDENTITY_REGISTRY_ADDRESS,
                fromBlock: 'earliest',
                toBlock: 'latest'
            }),
            publicClient.getLogs({
                address: REPUTATION_REGISTRY_ADDRESS,
                fromBlock: 'earliest',
                toBlock: 'latest'
            }),
            publicClient.getLogs({
                address: VALIDATION_REGISTRY_ADDRESS,
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

export async function fetchAgentDetails(id: string) {
    // Re-use fetch logic or optimize
    const agents = await fetchAgents();
    return agents.find(a => a.id === id) || null;
}
