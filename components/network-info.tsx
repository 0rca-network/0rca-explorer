"use client"
import Link from "next/link"
import { useNetwork } from "@/contexts/network-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExternalLink } from "lucide-react"
import contracts from "@/lib/contracts.json"

export function NetworkInfo() {
  const { network, setNetwork } = useNetwork()

  const activeContracts = network === 'ganache' ? contracts.ganache : contracts.cronosTestnet
  const explorerUrl = network === 'ganache' ? '' : 'https://explorer.cronos.org/testnet/address'

  const ContractLink = ({ label, address }: { label: string, address: string }) => {
    if (!address) return null;
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-300 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]" title={address}>
            {address}
          </span>
          {explorerUrl && (
            <Link href={`${explorerUrl}/${address}`} target="_blank" className="text-zinc-600 hover:text-white transition-colors">
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-white/5 bg-zinc-950/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Network Switcher */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">Network:</span>
            <Select value={network} onValueChange={(v: any) => setNetwork(v)}>
              <SelectTrigger className="w-[180px] bg-zinc-900 border-white/10 text-white h-9">
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testnet">Cronos Testnet</SelectItem>
                <SelectItem value="ganache">Localnet (Ganache)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contract Addresses */}
          <div className="flex flex-wrap gap-6 md:gap-8">
            <ContractLink label="Identity Registry" address={activeContracts.identityRegistry} />
            <ContractLink label="Reputation Registry" address={activeContracts.reputationRegistry} />
            <ContractLink label="Validation Registry" address={activeContracts.validationRegistry} />
          </div>

        </div>
      </div>
    </div>
  )
}
