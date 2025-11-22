"use client"

import { SearchBar } from "@/components/search-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Globe, Activity, CheckCircle2, Box } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, use } from "react"
import { useNetwork } from "@/contexts/network-context"

interface Task {
  id: string
  success: boolean
  timestamp: number
  details: string
  executor: string
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { network } = useNetwork()
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<Record<string, any>>({})
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/agents/${id}`)
        if (!response.ok) throw new Error('Failed to fetch agent data')
        const data = await response.json()
        setDetails(data.details || {})
        setTasks(data.tasks || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen">
        <SearchBar />
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-zinc-500 text-lg">Loading agent details...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <SearchBar />
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-red-500 text-lg">Error: {error}</p>
          <Link href="/agents" className="text-blue-400 hover:underline mt-4 inline-block">
            Back to Agents
          </Link>
        </div>
      </main>
    )
  }

  const successRate = tasks.length > 0
    ? ((tasks.filter(t => t.success).length / tasks.length) * 100).toFixed(1)
    : "0.0"

  return (
    <main className="min-h-screen">
      <SearchBar />

      <div className="container mx-auto px-6 pb-16">
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Agent {id}
            </h1>
            <p className="text-zinc-400 text-lg">
              App ID: {id}
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm px-4 py-2"
          >
            Active
          </Badge>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <Card className="bg-zinc-900/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-zinc-400">Total Tasks</span>
              </div>
              <div className="text-3xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-zinc-400">Success Rate</span>
              </div>
              <div className="text-3xl font-bold">{successRate}%</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Box className="h-5 w-5 text-amber-400" />
                <span className="text-sm text-zinc-400">Global State Items</span>
              </div>
              <div className="text-3xl font-bold">{Object.keys(details).length}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-zinc-400">Network</span>
              </div>
              <div className="text-xl font-bold capitalize">{network}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">

            {/* Tasks Section */}
            <Card className="bg-zinc-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-zinc-500">No tasks found.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                      <div className={`h - 2 w - 2 rounded - full mt - 2 ${task.success ? 'bg-emerald-400' : 'bg-red-400'} `} />
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">{task.details}</div>
                        <div className="flex justify-between items-center text-xs text-zinc-500">
                          <span>ID: {task.id}</span>
                          <span>{new Date(task.timestamp * 1000).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 text-xs font-mono text-zinc-600 truncate">
                          Executor: {task.executor}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Global State Section */}
            <Card className="bg-zinc-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Global State</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(details).length === 0 ? (
                  <p className="text-zinc-500">No global state found.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(details).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg bg-black/20 border border-white/5">
                        <div className="text-xs text-zinc-500 mb-1">{key}</div>
                        <div className="font-mono text-sm text-zinc-300 break-all">
                          {String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-start gap-3">
                    <Copy className="h-5 w-5 text-zinc-400 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-zinc-500 mb-2">Application ID</div>
                      <div className="font-mono text-sm bg-black/20 p-3 rounded-lg border border-white/5 break-all">
                        {id}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Raw Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono bg-black/40 p-4 rounded-lg overflow-x-auto border border-white/5 text-zinc-300 max-h-60">
                  {JSON.stringify({ details, tasks }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
