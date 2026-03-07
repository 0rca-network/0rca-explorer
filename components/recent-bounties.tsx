"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Terminal, Cpu } from "lucide-react"

export function RecentBounties() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBounties = async () => {
            try {
                const res = await fetch('/api/transactions')
                const data = await res.json()
                setTransactions(data.transactions || [])
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchBounties()
        const interval = setInterval(fetchBounties, 5000)
        return () => clearInterval(interval)
    }, [])

    if (loading && transactions.length === 0) return (
        <div className="p-8 text-center text-zinc-500 animate-pulse bg-zinc-900/20 rounded-2xl border border-white/5 border-dashed">
            Syncing x402 Protocol Events...
        </div>
    )

    const bountyEvents = transactions.filter(tx => tx.type.includes("Bounty"));

    return (
        <Card className="bg-zinc-900/50 border-white/10 mt-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Cpu className="w-24 h-24 text-blue-500" />
            </div>
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-blue-400" />
                    Autonomous Settlement Feed (Avalanche L1)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                    {bountyEvents.length === 0 ? (
                        <div className="p-12 text-center text-zinc-600 italic">
                            No active x402 bounties detected. Commission a task from Agent A.
                        </div>
                    ) : (
                        bountyEvents.map((tx) => (
                            <div key={tx.id} className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <Badge className={`${tx.type === "Bounty Created" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-500"} border-none px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest`}>
                                            {tx.type}
                                        </Badge>
                                        {tx.metadata?.requester_platform && (
                                            <Badge className="bg-purple-500/10 text-purple-400 border-none px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                                                Source: {tx.metadata.requester_platform}
                                            </Badge>
                                        )}
                                        {tx.metadata?.protocol && (
                                            <Badge variant="outline" className="border-white/10 text-zinc-500 text-[9px] font-mono">
                                                {tx.metadata.protocol}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="text-zinc-600 text-sm font-normal">Task:</span>
                                        {tx.metadata?.task_type || "Generic Compute"}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                                        <span>Tx: {tx.id.slice(0, 12)}...</span>
                                        <span>•</span>
                                        <span>{new Date(tx.timestamp * 1000).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-emerald-400">{tx.metadata?.amount || "0"} <span className="text-xs font-normal text-zinc-500 ml-1">USDT</span></div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-black mt-1">Settled on Avalanche L1</div>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 hover:border-blue-500/50 transition-all cursor-pointer">
                                        <ExternalLink className="h-4 w-4 text-zinc-500" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
