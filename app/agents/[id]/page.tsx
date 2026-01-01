"use client"

import { SearchBar } from "@/components/search-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Activity, ShieldCheck, User, Calendar, ExternalLink, Star } from "lucide-react"
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
    <button onClick={handleCopy} className="p-1 hover:bg-white/10 rounded-md transition-colors">
      <Copy className={`h-4 w-4 ${copied ? "text-emerald-400" : "text-zinc-500"}`} />
    </button>
  )
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { network } = useNetwork()
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/agents/${id}?network=${network}`)
        if (!res.ok) {
          throw new Error('Agent not found or API error')
        }
        const data = await res.json()

        if (data.details) {
          setAgent(data.details)
        } else if (data.id && data.status) {
          setAgent(data)
        } else {
          throw new Error('Invalid agent data received')
        }
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
      <main className="min-h-screen bg-black">
        <SearchBar />
        <div className="container mx-auto px-6 py-20 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-t-emerald-500 border-zinc-800 animate-spin mb-4"></div>
            <p className="text-zinc-500">Loading Agent Identity...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !agent) {
    return (
      <main className="min-h-screen bg-black">
        <SearchBar />
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Agent Not Found</h1>
          <p className="text-zinc-500 mb-8">The agent with ID {id} could not be retrieved from the {network} registry.</p>
          <Link href="/" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors">
            Return to Explorer
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/20">
      <SearchBar />

      <div className="container mx-auto px-6 pb-20 pt-8">
        {/* Breadcrumb */}
        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-emerald-400 transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Agents Directory
        </Link>

        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 p-8 mb-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-64 h-64 text-emerald-500 rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl">
              <User className="h-12 w-12 text-zinc-600" />
              {/* If we had an image, <img src={agent.image} ... /> */}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">
                  {agent.status.toUpperCase()}
                </Badge>
                <span className="text-zinc-500 text-xs font-mono">ID: {agent.id}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent mb-4">
                {agent.name}
              </h1>

              <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
                {agent.description || "No description provided for this agent."}
              </p>

              <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-sm">Creator:</span>
                  <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/5">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                    <span className="text-sm font-medium">{agent.creatorName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-400 text-sm">Created {new Date(agent.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-zinc-500" />
                  <a href={`https://explorer.cronos.org/testnet/address/${agent.address}`} target="_blank" className="text-emerald-400 hover:underline text-sm truncate max-w-[150px]">
                    {agent.address}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Identity Card */}
          <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
                IDENTITY REGISTRY
                <User className="h-4 w-4 text-blue-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="group relative">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Owner Address</label>
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                    <span className="font-mono text-sm text-zinc-300 truncate mr-2">{agent.address}</span>
                    <CopyButton text={agent.address} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reputation Card */}
          <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
                REPUTATION SCORE
                <Star className="h-4 w-4 text-amber-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                  {/* Circular Progress Mockup */}
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" strokeDasharray={`${Math.min(agent.reputation.score, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{agent.reputation.score}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Based on feedback</p>
                  <div className="text-2xl font-bold">{agent.reputation.count}</div>
                  <div className="text-xs text-zinc-500">Total Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Card */}
          <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
                VALIDATION STATUS
                <Activity className="h-4 w-4 text-emerald-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Validators</span>
                  <span className="text-white font-mono">{agent.validation.count}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Quality Score</span>
                    <span>{agent.validation.score}/100</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(agent.validation.score, 100)}%` }}></div>
                  </div>
                </div>
                <div className="pt-2">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-none">
                    {agent.validation.count > 0 ? "Validated" : "Pending Validation"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  )
}
