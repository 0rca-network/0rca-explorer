"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type Network = "testnet" | "mainnet" | "ganache"

interface NetworkContextType {
  network: Network
  setNetwork: (network: Network) => void
  appId: number
  loggingAppId: number
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [network, setNetworkState] = useState<Network>("testnet")

  // Initialize from LocalStorage or URL
  useEffect(() => {
    const storedNetwork = localStorage.getItem('orca_network') as Network
    const networkParam = searchParams.get('network') as Network

    const initialNetwork = networkParam || storedNetwork || "testnet"

    if (["testnet", "ganache"].includes(initialNetwork)) {
      setNetworkState(initialNetwork)
      if (!networkParam) {
        // Sync URL if missing but exists in storage
        const params = new URLSearchParams(searchParams.toString())
        params.set('network', initialNetwork)
        router.replace(`?${params.toString()}`)
      }
    }
  }, []) // Run once on mount

  // Watch URL changes
  useEffect(() => {
    const networkParam = searchParams.get('network') as Network
    if (networkParam && networkParam !== network && ["testnet", "ganache"].includes(networkParam)) {
      setNetworkState(networkParam)
      localStorage.setItem('orca_network', networkParam)
    }
  }, [searchParams, network])

  const setNetwork = (newNetwork: Network) => {
    setNetworkState(newNetwork)
    localStorage.setItem('orca_network', newNetwork)

    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('network', newNetwork)
    router.replace(`?${params.toString()}`)
  }

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