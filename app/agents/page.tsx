"use client"

import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useNetwork } from "@/contexts/network-context"



const ITEMS_PER_PAGE = 6

export default function AgentsPage() {
  const [view, setView] = useState<"list" | "tiles">("list")
  const [allAgents, setAllAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { network } = useNetwork()
  const searchParams = useSearchParams()
  const currentPage = Number.parseInt(searchParams.get("page") || "1")
  const searchQuery = searchParams.get("search") || ""

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`/api/agents?network=${network}`)
        const data = await response.json()

        const agentsList = data.agents || []

        const formattedAgents = agentsList.map((agent: any) => ({
          id: agent.id.toString(),
          name: agent.name,
          author: agent.creatorName,
          description: agent.description,
          status: "active",
          dateDeployed: new Date(agent.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          assetId: `100${agent.id.toString().slice(0, 7)}` // Simplified asset ID generation
        }))
        setAllAgents(formattedAgents)
      } catch (error) {
        console.error('Failed to fetch agents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [network])

  const filteredAgents = useMemo(() => {
    if (!searchQuery) return allAgents
    const query = searchQuery.toLowerCase()
    return allAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.author.toLowerCase().includes(query),
    )
  }, [searchQuery, allAgents])

  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedAgents = filteredAgents.slice(startIndex, endIndex)

  return (
    <main className="min-h-screen">
      <SearchBar />

      <div className="container mx-auto px-6 pb-16">
        <div className="mb-8">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                AI Agents
              </h1>
              <p className="text-zinc-400 text-lg">
                Explore autonomous agents operating on Algorand
                {searchQuery && (
                  <span className="ml-2 text-zinc-500">
                    ({filteredAgents.length} result{filteredAgents.length !== 1 ? "s" : ""})
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
            <p className="text-zinc-500 text-lg">Loading agents...</p>
          </div>
        ) : paginatedAgents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">No agents found matching your search.</p>
          </div>
        ) : view === "list" ? (
          <div className="space-y-2">
            {paginatedAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="group block p-3 rounded-xl bg-zinc-900/50 border border-white/10 hover:border-white/20 hover:bg-zinc-900/70 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors">
                        {agent.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${agent.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          }`}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-zinc-500">Created by {agent.author}</div>
                  </div>

                  <div className="flex items-center gap-8 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-xs text-zinc-500 mb-1">Asset ID</div>
                      <div className="font-mono text-sm text-zinc-400">{agent.assetId}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-zinc-500 mb-1">Date Deployed</div>
                      <div className="text-sm text-zinc-400">{agent.dateDeployed}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="group block p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/20 hover:bg-zinc-900/70 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge
                    variant="outline"
                    className={`${agent.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}
                  >
                    {agent.status}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-white/90 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{agent.description}</p>

                <div className="flex items-center justify-center pt-4 border-t border-white/5">
                  <div className="text-center">
                    <div className="text-xs text-zinc-500 mb-1">Date Deployed</div>
                    <div className="text-sm text-zinc-400">{agent.dateDeployed}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="text-xs text-zinc-500">Created by</div>
                  <div className="text-sm text-zinc-300 mt-1">{agent.author}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
      </div>
    </main>
  )
}
