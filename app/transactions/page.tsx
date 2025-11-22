"use client"

import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, LayoutGrid, List } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useNetwork } from "@/contexts/network-context"



const ITEMS_PER_PAGE = 18

export default function TransactionsPage() {
  const [view, setView] = useState<"list" | "tiles">("list")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { network } = useNetwork()
  const searchParams = useSearchParams()
  const currentPage = Number.parseInt(searchParams.get("page") || "1")
  const searchQuery = searchParams.get("search") || ""

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/transactions?network=${network}`)
        const data = await response.json()
        const transactions = data.transactions || []
        const formattedTransactions = transactions.map((tx: any) => ({
          id: tx.id,
          type: "Application Call", // Default or infer from tx
          date: new Date(tx.timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          agent: `Agent ${tx.sender.slice(0, 8)}...`
        }))
        setAllTransactions(formattedTransactions)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [network])

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return allTransactions
    const query = searchQuery.toLowerCase()
    return allTransactions.filter((tx) => tx.id.toLowerCase().includes(query) || tx.agent.toLowerCase().includes(query))
  }, [searchQuery, allTransactions])

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <main className="min-h-screen">
      <SearchBar />

      <div className="container mx-auto px-6 pb-16">
        <div className="mb-8">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Transactions
              </h1>
              <p className="text-zinc-400 text-lg">
                Track all agent transactions on Algorand blockchain
                {searchQuery && (
                  <span className="ml-2 text-zinc-500">
                    ({filteredTransactions.length} result{filteredTransactions.length !== 1 ? "s" : ""})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("list")}
                className={`h-10 w-10 rounded-lg ${view === "list" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("tiles")}
                className={`h-10 w-10 rounded-lg ${view === "tiles" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">Loading transactions...</p>
          </div>
        ) : paginatedTransactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">No transactions found matching your search.</p>
          </div>
        ) : view === "list" ? (
          <div className="rounded-2xl bg-zinc-900/50 border border-white/10 overflow-hidden">
            <div className="border-b border-white/10">
              <h2 className="text-2xl font-bold p-6 text-white">Recent Transactions</h2>
            </div>

            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 border-b border-white/10 text-sm font-medium text-zinc-400">
              <div>Transaction ID</div>
              <div className="w-40">Type</div>
              <div className="w-48 text-right">Date</div>
            </div>

            <div className="divide-y divide-white/5">
              {paginatedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <a
                      href={`https://testnet.algoexplorer.io/tx/${tx.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-blue-400 hover:text-blue-300 truncate"
                    >
                      {tx.id}
                    </a>
                    <button
                      onClick={() => copyToClipboard(tx.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title="Copy transaction ID"
                    >
                      {copiedId === tx.id ? (
                        <span className="text-xs text-emerald-400">✓</span>
                      ) : (
                        <Copy className="h-4 w-4 text-zinc-500 hover:text-white" />
                      )}
                    </button>
                    <a
                      href={`https://testnet.algoexplorer.io/tx/${tx.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title="View on AlgoExplorer"
                    >
                      <ExternalLink className="h-4 w-4 text-zinc-500 hover:text-white" />
                    </a>
                  </div>
                  <div className="w-40 flex items-center">
                    <span className="text-sm text-zinc-300">{tx.type}</span>
                  </div>
                  <div className="w-48 flex items-center justify-end">
                    <span className="text-sm text-zinc-400">{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/20 hover:bg-zinc-900/70 transition-all group"
              >
                <div className="mb-4">
                  <div className="text-xs text-zinc-500 mb-2">Transaction ID</div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://testnet.algoexplorer.io/tx/${tx.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-blue-400 hover:text-blue-300 truncate"
                    >
                      {tx.id.slice(0, 16)}...
                    </a>
                    <button
                      onClick={() => copyToClipboard(tx.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      {copiedId === tx.id ? (
                        <span className="text-xs text-emerald-400">✓</span>
                      ) : (
                        <Copy className="h-4 w-4 text-zinc-500 hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Type</div>
                    <div className="text-sm text-zinc-300">{tx.type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Agent</div>
                    <div className="text-sm text-zinc-300">{tx.agent}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Date</div>
                    <div className="text-sm text-zinc-400">{tx.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
      </div>
    </main>
  )
}
