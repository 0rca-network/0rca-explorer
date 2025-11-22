import algosdk from "algosdk";

const INDEXER_URL = "https://testnet-idx.algonode.cloud";
const LOGGING_APP_ID = 749653154;

async function debug() {
    const indexerClient = new algosdk.Indexer("", INDEXER_URL, "");

    console.log(`Fetching transactions for App ID: ${LOGGING_APP_ID}...`);

    try {
        const res = await indexerClient.searchForTransactions()
            .applicationID(LOGGING_APP_ID)
            .limit(5)
            .do();

        const txns = res.transactions || [];
        console.log(`Found ${txns.length} transactions.`);

        if (txns.length > 0) {
            console.log("First transaction sample:");
            console.log(JSON.stringify(txns[0], (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
            console.log("Round Time:", txns[0]["round-time"]);
        }
    } catch (e) {
        console.error(e);
    }
}

debug();
