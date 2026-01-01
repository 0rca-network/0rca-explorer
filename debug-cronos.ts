import { fetchAgents, fetchTransactions } from './lib/cronos';

async function main() {
    console.log("Verifying Cronos Integration...");

    try {
        console.log("Fetching Agents...");
        const agents = await fetchAgents();
        console.log(`Found ${agents.length} agents.`);
        if (agents.length > 0) {
            console.log("First Agent:", agents[0]);
        } else {
            console.log("No agents found (expected if newly deployed).");
        }

        console.log("Fetching Transactions...");
        const txs = await fetchTransactions();
        console.log(`Found ${txs.length} registry transactions.`);
        if (txs.length > 0) {
            console.log("First TX:", txs[0]);
        }

        console.log("✅ Verification Complete.");
    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

main();
