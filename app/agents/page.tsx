"use client"

import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Filter, Star, CheckCircle2, ShieldCheck, User } from "lucide-react"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useNetwork } from "@/contexts/network-context"

const ITEMS_PER_PAGE = 10

export default function AgentsPage() {
  const router = useRouter()
  const [view, setView] = useState<"list" | "tiles">("list")
  const [activeTab, setActiveTab] = useState("Overview")
  const [allAgents, setAllAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { network } = useNetwork()
  const searchParams = useSearchParams()
  const currentPage = Number.parseInt(searchParams.get("page") || "1")
  const searchQuery = searchParams.get("search") || ""

  // Active Filter states
  const isVerifiedOnly = searchParams.get("verified") === "true"
  const isTopRatedOnly = searchParams.get("reputation") === "90"

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true)
      try {
        // Build query string based on active filters
        const params = new URLSearchParams()
        params.set('network', network)
        if (isVerifiedOnly) params.set('verified', 'true')
        if (isTopRatedOnly) params.set('reputation', '90')
        if (searchQuery) params.set('search', searchQuery)

        const response = await fetch(`/api/agents?${params.toString()}`)
        const data = await response.json()

        const agentsList = data.agents || []

        const formattedAgents = agentsList.map((agent: any) => ({
          id: agent.id.toString(),
          name: agent.name,
          author: agent.creatorName,
          description: agent.description,
          status: "Active",
          owner: agent.address,
          reputation: agent.reputation?.score || 0,
          feedback: agent.reputation?.count || 0,
          verified: (agent.validation?.count || 0) > 0,
          dateDeployed: new Date(agent.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }))
        setAllAgents(formattedAgents)
      } catch (error) {
        console.error('Failed to fetch agents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [network, isVerifiedOnly, isTopRatedOnly, searchQuery])

  const toggleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1') // Reset to page 1 on filter
    router.push(`?${params.toString()}`)
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <SearchBar />

      <div className="container mx-auto px-6 py-8">

        {/* Header and Core Filters */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 mb-1">Top Rated Agents</h1>
              <p className="text-zinc-500 text-sm">{allAgents.length} agents found</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-4 text-xs font-medium rounded-md transition-all ${activeTab === 'Overview' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                  onClick={() => setActiveTab('Overview')}
                >
                  Overview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-4 text-xs font-medium rounded-md transition-all ${activeTab === 'ID' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                  onClick={() => setActiveTab('ID')}
                >
                  ID
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-4 text-xs font-medium rounded-md transition-all ${activeTab === 'Validations' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                  onClick={() => setActiveTab('Validations')}
                >
                  Validations
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-4 text-xs font-medium rounded-md transition-all ${activeTab === 'Analytics' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                  onClick={() => setActiveTab('Analytics')}
                >
                  Analytics
                </Button>
              </div>

              <div className="flex items-center gap-1 border-l border-zinc-200 ml-2 pl-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView("list")}
                  className={`h-9 w-9 rounded-md ${view === "list" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"}`}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView("tiles")}
                  className={`h-9 w-9 rounded-md ${view === "tiles" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className={`h-9 px-4 rounded-md border-zinc-200 text-xs font-medium transition-all ${!isVerifiedOnly && !isTopRatedOnly ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600'}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.delete('verified')
                params.delete('reputation')
                router.push(`?${params.toString()}`)
              }}
            >
              All Agents
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`h-9 px-4 rounded-md border-zinc-200 text-xs font-medium gap-2 transition-all ${isVerifiedOnly ? 'bg-zinc-100 text-zinc-900 border-zinc-300' : 'bg-white text-zinc-600'}`}
              onClick={() => toggleFilter('verified', 'true')}
            >
              <CheckCircle2 className={`h-3.5 w-3.5 ${isVerifiedOnly ? 'text-blue-500' : 'text-zinc-400'}`} />
              Verified
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`h-9 px-4 rounded-md border-zinc-200 text-xs font-medium gap-2 transition-all ${isTopRatedOnly ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-white text-zinc-600'}`}
              onClick={() => toggleFilter('reputation', '90')}
            >
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              Top Rated (90+)
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-zinc-200 border-dashed">
            <div className="h-10 w-10 border-4 border-zinc-200 border-t-zinc-900 animate-spin rounded-full mb-4"></div>
            <p className="text-zinc-500 font-medium">Scanning Agent Registry...</p>
          </div>
        ) : allAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-zinc-200 border-dashed">
            <p className="text-zinc-500">No agents found matching your query.</p>
          </div>
        ) : view === "list" ? (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider w-[35%]">Agent</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Chain</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Reputation</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Feedback</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {allAgents.map((agent) => (
                  <tr key={agent.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/agents/${agent.id}`} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 border border-zinc-200">
                          <User className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                            {agent.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                            {agent.description}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${network === 'ganache' ? 'bg-zinc-100 text-zinc-600' : 'bg-blue-500 text-white'} border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase`}>
                        • {network === 'ganache' ? 'Localnet' : 'Cronos Testnet'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-zinc-500 font-mono tracking-tight">{truncateAddress(agent.owner)}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-900">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span>{agent.reputation}</span>
                        <span className="text-zinc-400 font-normal">/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-600 font-medium">{agent.feedback}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className="bg-zinc-50 text-zinc-500 border-zinc-200 text-[10px] font-bold uppercase px-3 rounded-md">
                        {agent.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="group block p-6 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-zinc-400" />
                  </div>
                  <Badge variant="outline" className="bg-zinc-50 text-zinc-400 border-zinc-200 text-[10px] uppercase">
                    {agent.status}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold mb-1 text-zinc-900 group-hover:text-blue-600 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-6 line-clamp-2 min-h-[40px]">{agent.description}</p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Reputation</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {agent.reputation}/100
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Feedback</span>
                    <span className="text-xs font-bold text-zinc-900">{agent.feedback}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && allAgents.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={Math.ceil(allAgents.length / ITEMS_PER_PAGE)} />
          </div>
        )}
      </div>
    </main>
  )
}
