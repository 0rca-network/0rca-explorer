import algosdk from "algosdk";
import { AlgorandClient } from '@algorandfoundation/algokit-utils';

// ===== CONFIG =====
const ALGOD_URL = "https://testnet-api.algonode.cloud";
const AGENT_APP_IDS = [
    749655394n,
    749660669n,
    749660886n,
    749661300n,
    749893638n,
    749655977n,
    749656277n,
    749661610n,
    749663128n,
    749702255n
];

async function debug() {
    console.log(`🚀 Starting Agent Details Debug Script (Scanning ${AGENT_APP_IDS.length} agents)...`);

    const algorand = AlgorandClient.testNet();
    const algodClient = new algosdk.Algodv2("", ALGOD_URL, "");

    // Task Struct: (uint64,bool,uint64,string,address)
    const taskAbiType = algosdk.ABIType.from("(uint64,bool,uint64,string,address)");

    for (const appId of AGENT_APP_IDS) {
        console.log(`\n--------------------------------------------------`);
        console.log(`🔎 Checking Agent App ID: ${appId}`);

        try {
            // 1. Global State
            const appInfo = await algodClient.getApplicationByID(Number(appId)).do();
            const globalState = appInfo.params['global-state'] || [];
            if (globalState.length > 0) {
                console.log(`  🌍 Global State (${globalState.length} items):`);
                for (const state of globalState) {
                    const key = Buffer.from(state.key, 'base64').toString();
                    console.log(`    - ${key}: ${state.value.uint || state.value.bytes}`);
                }
            } else {
                console.log(`  🌍 Global State: Empty`);
            }

            // 2. Boxes
            const boxNames = await algorand.app.getBoxNames(appId);
            console.log(`  📦 Boxes: ${boxNames.length}`);

            for (const box of boxNames) {
                let nameRaw: Uint8Array;
                if ('nameRaw' in box) {
                    nameRaw = (box as any).nameRaw;
                } else if (box.name && 'nameRaw' in box.name) {
                    nameRaw = box.name.nameRaw;
                } else {
                    nameRaw = (box as any).name || new Uint8Array();
                }

                // Try to decode as Task
                try {
                    const content = await algorand.app.getBoxValue(appId, nameRaw);
                    const decoded = taskAbiType.decode(content) as any;
                    console.log(`    ✅ Decoded Task Box:`, JSON.stringify(decoded, (_, v) => typeof v === 'bigint' ? v.toString() : v, 0));
                } catch (e) {
                    // console.log(`    ⚠️ Failed to decode box as Task`);
                }
            }

        } catch (e) {
            console.log(`  ❌ Error: ${e.message}`);
        }
    }
}

debug();
