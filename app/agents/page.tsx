"use client"

import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Filter, Star, CheckCircle2, ShieldCheck, User, Activity } from "lucide-react"
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
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <SearchBar />

      <div className="container mx-auto px-6 py-12">

        {/* Header and Core Filters */}
        <div className="relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-2xl p-8 mb-8 backdrop-blur-xl">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent mb-2">
                Agent Registry
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3">
                  {allAgents.length} Available
                </Badge>
                <span className="text-zinc-500 text-sm">Indexed on {network === 'ganache' ? 'Localnet' : 'Cronos'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                {['Overview', 'ID', 'Validations', 'Analytics'].map((tab) => (
                  <Button
                    key={tab}
                    variant="ghost"
                    size="sm"
                    className={`h-9 px-5 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView("list")}
                  className={`h-9 w-9 rounded-md ${view === "list" ? "bg-white/10 text-white" : "text-zinc-600"}`}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView("tiles")}
                  className={`h-9 w-9 rounded-md ${view === "tiles" ? "bg-white/10 text-white" : "text-zinc-600"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className={`h-10 px-6 rounded-xl border-white/5 text-xs font-bold transition-all ${!isVerifiedOnly && !isTopRatedOnly
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/40'
                  : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800'
                }`}
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
              className={`h-10 px-6 rounded-xl border-white/5 text-xs font-bold gap-2.5 transition-all ${isVerifiedOnly ? 'bg-blue-500/10 text-blue-400 border-blue-500/40' : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800'}`}
              onClick={() => toggleFilter('verified', 'true')}
            >
              <CheckCircle2 className={`h-4 w-4 ${isVerifiedOnly ? 'text-blue-400' : 'text-zinc-600'}`} />
              Verified Only
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`h-10 px-6 rounded-xl border-white/5 text-xs font-bold gap-2.5 transition-all ${isTopRatedOnly ? 'bg-amber-500/10 text-amber-400 border-amber-500/40' : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800'}`}
              onClick={() => toggleFilter('reputation', '90')}
            >
              <Star className={`h-4 w-4 ${isTopRatedOnly ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
              Top Rated (90+)
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-zinc-900/20 rounded-3xl border border-white/5 border-dashed">
            <div className="h-12 w-12 border-4 border-zinc-800 border-t-blue-500 animate-spin rounded-full mb-6" />
            <p className="text-zinc-500 font-bold tracking-widest text-sm uppercase">Syncing with Cronos Node...</p>
          </div>
        ) : allAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-zinc-900/20 rounded-3xl border border-white/5 border-dashed">
            <Activity className="h-12 w-12 text-zinc-800 mb-4" />
            <p className="text-zinc-600 font-medium">No agents found in this cluster.</p>
          </div>
        ) : view === "list" ? (
          <div className="overflow-hidden bg-zinc-900/30 border border-white/5 rounded-2xl backdrop-blur-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] w-[40%]">Agent Identity</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Network</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Ownership</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Reputation</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Signals</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allAgents.map((agent) => (
                  <tr key={agent.id} className="group hover:bg-white/[0.02] transition-colors relative">
                    <td className="px-8 py-6">
                      <Link href={`/agents/${agent.id}`} className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-blue-500/50 transition-all shadow-2xl">
                          <User className="h-6 w-6 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate mb-1">
                            {agent.name}
                          </div>
                          <div className="text-xs text-zinc-500 truncate max-w-[280px]">
                            {agent.description || "Experimental AI entity"}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={`${network === 'ganache' ? 'bg-zinc-800 text-zinc-400' : 'bg-blue-500/10 text-blue-400'} border-none px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase`}>
                        {network === 'ganache' ? 'Localnet' : 'Cronos T3'}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-xs text-zinc-400 font-mono tracking-tighter bg-white/5 px-2 py-1 rounded-md">{truncateAddress(agent.owner)}</code>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-bold text-sm text-white">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span>{agent.reputation}</span>
                        <span className="text-zinc-600 font-normal text-xs">/100</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-zinc-600" />
                        <span className="text-xs text-zinc-300 font-bold">{agent.feedback}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="group relative block p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 hover:bg-zinc-900/60 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheck className="w-20 h-20 text-blue-500" />
                </div>

                <div className="flex items-start justify-between mb-8">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                    <User className="h-7 w-7 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest px-3">
                    Active
                  </Badge>
                </div>

                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-8 line-clamp-2 min-h-[40px] leading-relaxed italic">
                  "{agent.description || "No description provided."}"
                </p>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.1em]">Trust Score</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      {agent.reputation}/100
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.1em]">Feedbacks</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                      <Activity className="h-3.5 w-3.5 text-zinc-600" />
                      {agent.feedback}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && allAgents.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={Math.ceil(allAgents.length / ITEMS_PER_PAGE)} />
          </div>
        )}
      </div>
    </main>
  )
}
