"use client"

import { useNetwork } from "@/contexts/network-context"

export function NetworkInfo() {
  const { network } = useNetwork()

  const networkConfig = {
    testnet: {
      name: "Cronos TestNet",
      appId: "749655317",
      assetId: "749653154"
    },
    mainnet: {
      name: "Cronos MainNet",
      appId: "0987654321",
      assetId: "1234567890"
    }
  }

  const config = networkConfig[network]

  return (
    <div className="border-b border-white/5 bg-zinc-950/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Network:</span>
            <span className="font-mono text-white font-medium">{config.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">App ID:</span>
            <span className="font-mono text-zinc-300 truncate max-w-[200px] md:max-w-none">{config.appId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Asset ID:</span>
            <span className="font-mono text-zinc-300 truncate max-w-[200px] md:max-w-none">{config.assetId}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
