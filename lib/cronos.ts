import { createPublicClient, http, defineChain, parseAbiItem, fromHex } from 'viem';
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
    let chain = cronosTestnetChain;
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
        // Direct approach: Only get very recent logs to avoid slow scanning
        const currentBlock = await client.getBlockNumber();
        const fromBlock = currentBlock - BigInt(100);

        const logs = await client.getLogs({ fromBlock, toBlock: 'latest' });

        return logs.slice(0, 10).map((l: any) => ({
            id: l.transactionHash,
            sender: '0x...',
            round: Number(l.blockNumber),
            timestamp: Date.now()
        }));
    } catch (error) {
        return [];
    }
}

export async function fetchAgentDetails(id: string, chainId: number = 338) {
    const agents = await fetchAgents(chainId);
    return agents.find(a => a.id === id) || null;
}
