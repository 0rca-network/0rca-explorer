"use client"

import { SearchBar } from "@/components/search-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, TrendingUp, Zap } from "lucide-react"
import { useNetwork } from "@/contexts/network-context"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { network } = useNetwork()
  const [agentsCount, setAgentsCount] = useState(0)
  const [transactionsCount, setTransactionsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, transactionsRes] = await Promise.all([
          fetch(`/api/agents?network=${network}`),
          fetch(`/api/transactions?network=${network}`)
        ])
        
        const agents = await agentsRes.json()
        const transactions = await transactionsRes.json()
        
        setAgentsCount(agents.length || 0)
        setTransactionsCount(transactions.length || 0)
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
      change: "+12.5%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Total Transactions",
      value: loading ? "..." : transactionsCount.toString(),
      change: "+8.2%",
      icon: Activity,
      trend: "up",
    },
    {
      title: "ALGO Volume",
      value: "2.4M",
      change: "+15.3%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Avg Response Time",
      value: "1.2s",
      change: "-5.1%",
      icon: Zap,
      trend: "down",
    },
  ]
  return (
    <main className="min-h-screen">
      <SearchBar />

      <div className="container mx-auto px-6 pb-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-zinc-400 text-lg">Monitor your AI agents on Algorand blockchain</p>
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
                    <span
                      className={`text-sm font-medium ${stat.trend === "up" ? "text-emerald-400" : "text-blue-400"}`}
                    >
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

        <Card className="bg-zinc-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Network Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Block Height</span>
                <span className="font-mono text-white">34,567,890</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-blue-500 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">TPS</span>
                <span className="font-mono text-white">1,247</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-purple-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Agent Uptime</span>
                <span className="font-mono text-emerald-400">99.8%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[99.8%] bg-gradient-to-r from-emerald-500 to-teal-500" />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="text-sm text-zinc-400 mb-2">Network Health</div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-medium">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
