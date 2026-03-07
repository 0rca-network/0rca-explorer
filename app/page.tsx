"use client"

import { SearchBar } from "@/components/search-bar"
import { RecentBounties } from "@/components/recent-bounties"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, TrendingUp, Zap, Globe } from "lucide-react"
import { useNetwork } from "@/contexts/network-context"
import { Suspense, useEffect, useState } from "react"

function DashboardContent() {
  const { network } = useNetwork()
  const [agentsCount, setAgentsCount] = useState(0)
  const [transactionsCount, setTransactionsCount] = useState(0)
  const [blockHeight, setBlockHeight] = useState<string>("0")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, transactionsRes] = await Promise.all([
          fetch(`/api/agents?network=${network}`),
          fetch(`/api/transactions?network=${network}`)
        ])

        const agentsData = await agentsRes.json()
        const transactionsData = await transactionsRes.json()

        setAgentsCount(agentsData.count || agentsData.agents?.length || 0)
        setTransactionsCount(transactionsData.transactions?.length || 0)
        if (transactionsData.blockHeight) {
          setBlockHeight(transactionsData.blockHeight)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [network])

  const stats = [
    {
      title: "Active Agents",
      value: loading ? "..." : agentsCount.toString(),
      change: "Live",
      icon: Users,
      trend: "up",
    },
    {
      title: "Recent Transactions",
      value: loading ? "..." : transactionsCount.toString(),
      change: "24h",
      icon: Activity,
      trend: "up",
    },
  ]

  return (
    <main className="min-h-screen">
      <SearchBar />

      <div className="container mx-auto px-6 pb-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent italic">
            0rca Interoperability Layer
          </h1>
          <p className="text-zinc-400 text-lg flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-400" />
            Cross-platform agent settlement on Avalanche L1
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-emerald-400">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-zinc-500">{stat.title}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentBounties />
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-zinc-900/50 border-white/10 mt-8 h-fit">
              <CardHeader>
                <CardTitle className="text-xl">Network L1 Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Identity Registry</span>
                    <span className="font-mono text-emerald-400">Operational</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-emerald-500" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Reputation Registry</span>
                    <span className="font-mono text-emerald-400">Operational</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-emerald-500" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Validation Registry</span>
                    <span className="font-mono text-emerald-400">Operational</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-emerald-500" />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-400 mb-1">Network Status</div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-white font-medium">Connected</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400 mb-1">Current Block</div>
                      <div className="font-mono text-white">{blockHeight}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-6 py-16 text-center text-zinc-500">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
