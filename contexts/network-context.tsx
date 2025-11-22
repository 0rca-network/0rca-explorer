"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Network = "testnet" | "mainnet"

interface NetworkContextType {
  network: Network
  setNetwork: (network: Network) => void
  appId: number
  loggingAppId: number
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<Network>("testnet")

  // Hardcoded for now as per user request for Testnet
  const appId = 749655317
  const loggingAppId = 749653154

  return (
    <NetworkContext.Provider value={{ network, setNetwork, appId, loggingAppId }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider")
  }
  return context
}