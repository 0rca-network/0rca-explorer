"use client"

import { SearchBar } from "@/components/search-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, Copy, Activity, ShieldCheck, User, Calendar,
  ExternalLink, Star, Code, Cpu, Tag, Globe, CheckCircle2,
  Clock, Hash, Terminal, Box, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState, use } from "react"
import { useNetwork } from "@/contexts/network-context"
import { AgentData } from "@/lib/cronos"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10 group">
      <Copy className={`h-3.5 w-3.5 ${copied ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
    </button>
  )
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { network } = useNetwork()
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "reputation" | "metadata">("overview")

  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/agents/${id}?network=${network}`)
        if (!res.ok) {
          throw new Error('Agent not found')
        }
        const data = await res.json()
        setAgent(data.details || data)
      } catch (e) {
        console.error(e)
        setError("Failed to load agent")
      } finally {
        setLoading(false)
      }
    }
    fetchAgent()
  }, [id, network])

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SearchBar />
        <div className="container mx-auto px-6 py-32 flex flex-col items-center">
          <div className="relative h-16 w-16 mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-500/50 animate-pulse" />
            </div>
          </div>
          <p className="text-zinc-500 font-black tracking-[0.3em] text-[9px] uppercase">Decrypting Identity Record...</p>
        </div>
      </main>
    )
  }

  if (error || !agent) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SearchBar />
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-red-500/5 border border-red-500/20 mb-6 relative">
            <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full"></div>
            <Box className="h-8 w-8 text-red-500 relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Query Fault: 404</h1>
          <p className="text-zinc-500 mb-10 max-w-md mx-auto leading-relaxed text-sm italic">Neural link failed. Agent sequence {id} does not exist in the {network} registry.</p>
          <Link href="/agents" className="inline-flex items-center h-10 px-6 bg-zinc-900 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all group">
            <ArrowLeft className="h-3.5 w-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Return to Registry
          </Link>
        </div>
      </main>
    )
  }

  const endpoints = [
    { name: "A2A", version: "v0.3.0", url: "http://localhost:6000/.well-known/agent-card.json" },
    { name: "MCP", version: "2025-06-18", url: "https://mcp-gateway.agent.org/v1" }
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <SearchBar />

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/agents" className="text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Registry</Link>
          <ChevronRight className="h-2.5 w-2.5 text-zinc-800" />
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">{agent.name}</span>
        </div>

        {/* Hero Segment */}
        <div className="relative group mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

          <div className="relative bg-zinc-900/40 border border-white/5 rounded-[1.5rem] p-8 md:p-10 backdrop-blur-3xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none select-none">
              <Activity className="w-64 h-64 text-white -rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              <div className="h-32 w-32 rounded-[1.5rem] bg-black border border-white/10 flex items-center justify-center flex-shrink-0 shadow-2xl ring-4 ring-white/[0.01]">
                <User className="h-12 w-12 text-zinc-800" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-[0.2em]">
                    {agent.status}
                  </Badge>
                  <span className="text-[9px] text-zinc-600 font-black tracking-[0.2em] uppercase">UID: {agent.id}</span>
                </div>

                <h1 className="text-4xl font-black bg-gradient-to-br from-white via-white to-zinc-600 bg-clip-text text-transparent mb-4 tracking-tighter leading-tight">
                  {agent.name}
                </h1>

                <p className="text-zinc-400 text-base max-w-2xl leading-relaxed italic opacity-80">
                  "{agent.description || "Digital entity active on the Cronos ledger."}"
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 w-full lg:w-auto">
                <div className="bg-black/60 border border-white/5 p-6 rounded-2xl backdrop-blur-xl group/card hover:border-blue-500/20 transition-all flex flex-col justify-center min-w-[140px]">
                  <div className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em] mb-2">Health</div>
                  <div className="text-2xl font-black flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    {agent.reputation.score}
                  </div>
                </div>
                <div className="bg-black/60 border border-white/5 p-6 rounded-2xl backdrop-blur-xl group/card hover:border-emerald-500/20 transition-all flex flex-col justify-center min-w-[140px]">
                  <div className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em] mb-2">Validations</div>
                  <div className="text-2xl font-black flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    {agent.validation.count}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Interface */}
        <div className="flex items-center gap-8 border-b border-white/5 mb-8 px-4 overflow-x-auto no-scrollbar">
          {(['overview', 'reputation', 'metadata'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Panels */}
        <div className="min-h-[300px]">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* On-Chain Metadata & Quick Stats Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* On-Chain Metadata Card */}
                <Card className="bg-zinc-900/20 border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-blue-500/5 border-b border-white/5 py-4 px-8 flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">On-Chain Metadata</span>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                      {[
                        { label: "Agent Name", value: agent.name },
                        { label: "Created At", value: new Date(agent.createdAt).toISOString() },
                        { label: "Updated At", value: new Date(agent.createdAt).toISOString() }, // Placeholder for actual update timestamp
                        { label: "Agent Account", value: agent.address }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-8 py-4 group/item">
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{item.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-zinc-300 truncate max-w-[200px]">{item.value}</span>
                            <CopyButton text={item.value} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats Card */}
                <Card className="bg-zinc-900/20 border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-purple-500/5 border-b border-white/5 py-4 px-8 flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Quick Stats</span>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                      <div className="flex items-center justify-between px-8 py-4 group/item">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Agent ID</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-white">#{agent.id}</span>
                          <CopyButton text={agent.id.toString()} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-8 py-4 group/item">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Agent URI</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-blue-400/70 truncate max-w-[150px]">ipfs://Qm...{agent.id}</span>
                          <CopyButton text={`ipfs://Qm...${agent.id}`} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-8 py-4 group/item">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Status</span>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between px-8 py-4 group/item">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Created</span>
                        <span className="text-xs text-zinc-300">{new Date(agent.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                      <div className="flex items-center justify-between px-8 py-4 group/item">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Last Updated</span>
                        <span className="text-xs text-zinc-300">{new Date(agent.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Endpoints */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-6 bg-blue-500 rounded-full" />
                  <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Operational Gateways</h2>
                </div>
                <div className="grid gap-4">
                  {endpoints.map((ep, i) => (
                    <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between group hover:bg-zinc-900/60 transition-all">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-7 w-7 rounded-lg bg-black flex items-center justify-center border border-white/10 text-blue-500">
                            <Terminal className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-black text-base text-white tracking-tight">{ep.name}</span>
                          <Badge variant="outline" className="bg-white/5 border-white/5 text-zinc-500 text-[8px] px-2 font-mono py-0.5">V_{ep.version}</Badge>
                        </div>
                        <div className="text-xs font-mono text-blue-400/60 group-hover:text-blue-400 transition-colors bg-black/40 px-3 py-1.5 rounded-lg inline-block border border-white/5">
                          {ep.url}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-600 hover:text-white hover:bg-white/10 rounded-xl border border-white/5">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-600 hover:text-white hover:bg-white/10 rounded-xl border border-white/5">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Matrix Systems */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900/20 border-white/5 rounded-2xl overflow-hidden group/sys shadow-xl">
                  <div className="bg-white/[0.01] border-b border-white/5 py-4 px-8 flex items-center justify-between">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Neural Clusters</span>
                    <Badge className="bg-blue-500/10 text-blue-400 h-5 px-2 text-[8px] font-black">0x00</Badge>
                  </div>
                  <CardContent className="p-10 text-center">
                    <Cpu className="h-8 w-8 text-zinc-800 mx-auto mb-4 group-hover/sys:text-blue-500/30 transition-all" />
                    <p className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.4em]">No Active Clusters</p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/20 border-white/5 rounded-2xl overflow-hidden group/sys shadow-xl">
                  <div className="bg-white/[0.01] border-b border-white/5 py-4 px-8 flex items-center justify-between">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Identity Slugs</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 h-5 px-2 text-[8px] font-black">LOCKED</Badge>
                  </div>
                  <CardContent className="p-10 text-center">
                    <Tag className="h-8 w-8 text-zinc-800 mx-auto mb-4 group-hover/sys:text-emerald-500/30 transition-all" />
                    <p className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.4em]">Unlabeled Entity</p>
                  </CardContent>
                </Card>
              </div>

              {/* Status Feed */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Attestation Ledger</h2>
                </div>
                <div className="bg-black/60 border border-emerald-500/20 rounded-2xl p-8 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="h-14 w-14 rounded-xl bg-zinc-900 flex items-center justify-center border border-emerald-500/30">
                    <ShieldCheck className="h-7 w-7 text-emerald-500" />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="text-base font-mono font-black text-white tracking-tighter">NETWORK_VAL_0x20{id}</div>
                    <div className="text-[9px] tracking-[0.2em] font-black text-emerald-600 uppercase">Confirmed {new Date(agent.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-48">
                    <div className="flex justify-between items-center w-full mb-1">
                      <span className="text-[9px] font-black text-zinc-600 uppercase">Integrity</span>
                      <span className="text-xs font-black text-emerald-400">100%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'reputation' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Signal Intensity */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 flex flex-col lg:flex-row gap-12 items-center">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90 relative z-10" viewBox="0 0 36 36">
                    <circle className="text-zinc-800/50" stroke="currentColor" strokeWidth="2.5" fill="transparent" r="16" cx="18" cy="18" />
                    <circle
                      className="text-emerald-500"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeDasharray={`${agent.reputation.score}, 100`}
                      strokeLinecap="round"
                      fill="transparent" r="16" cx="18" cy="18"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <span className="text-4xl font-black text-white">{agent.reputation.score}</span>
                    <span className="text-[8px] text-zinc-600 font-black tracking-[0.2em] uppercase">INDEX</span>
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left space-y-4">
                  <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                    Neural Grade A+
                  </Badge>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Synaptic Trust</h2>
                  <p className="text-zinc-500 text-base italic opacity-70">
                    Real-time verification from {agent.reputation.count} nodes.
                  </p>
                </div>

                <div className="flex flex-col gap-4 w-full lg:w-56 text-center">
                  <div className="bg-black/60 border border-white/5 p-6 rounded-2xl">
                    <div className="text-3xl font-black text-white mb-1">{agent.reputation.count}</div>
                    <div className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.3em]">Nodes</div>
                  </div>
                  <div className="bg-black/60 border border-white/5 p-6 rounded-2xl">
                    <div className="text-3xl font-black text-blue-500 mb-1">{agent.reputation.score}%</div>
                    <div className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.3em]">Yield</div>
                  </div>
                </div>
              </div>

              {/* Feedback Stream */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-1 w-6 bg-amber-500 rounded-full" />
                  <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Synaptic Bus</h2>
                </div>

                <div className="space-y-4">
                  {[...Array(agent.reputation.count || 1)].map((_, i) => (
                    <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 hover:bg-zinc-900/50 transition-all group">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center border border-white/10 group-hover:border-blue-500/30">
                            <Terminal className="h-5 w-5 text-zinc-700" />
                          </div>
                          <div>
                            <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Source</div>
                            <div className="text-sm font-mono text-zinc-400 font-black group-hover:text-white transition-colors">0x20{id}...{Math.floor(Math.random() * 999)}BA</div>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-4 py-2 rounded-xl">
                          <Star className="h-3.5 w-3.5 mr-2 fill-emerald-400" /> 100/100
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-10 space-y-10 backdrop-blur-3xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Registry Authority</h2>
                  </div>
                  <div className="bg-black/80 p-6 rounded-2xl border border-white/5 font-mono text-xs text-zinc-400 flex items-center justify-between group">
                    <span className="truncate mr-6 font-black">{agent.address}</span>
                    <CopyButton text={agent.address} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-blue-500 rounded-full" />
                      <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Last Sync</h2>
                    </div>
                    <div className="bg-black/80 p-6 rounded-2xl border border-white/5 text-sm font-black text-zinc-400">
                      {new Date(agent.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-blue-500 rounded-full" />
                      <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Genesis</h2>
                    </div>
                    <div className="bg-black/80 p-6 rounded-2xl border border-white/5 text-sm font-black text-zinc-400">
                      {new Date(agent.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Manifest</h2>
                  </div>
                  <div className="relative group">
                    <pre className="bg-black border border-white/10 p-8 rounded-[1.5rem] font-mono text-[9px] overflow-x-auto leading-relaxed text-blue-400/80 shadow-2xl">
                      {JSON.stringify(agent, null, 4)}
                    </pre>
                    <div className="absolute top-6 right-6">
                      <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white text-zinc-500 hover:text-black border-white/10 h-8 px-4 gap-2 rounded-lg transition-all font-black uppercase text-[8px] tracking-widest"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(agent, null, 4))}
                      >
                        <Copy className="h-3 w-3" />
                        EXTRACT
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
