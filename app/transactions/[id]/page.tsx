
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink, Calendar, Wallet, CheckCircle2, XCircle, Clock, FileJson, CreditCard, Hash } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export const revalidate = 0

interface Transaction {
    id: string
    wallet_address: string
    agent_id: string | null
    task_id: string | null
    amount: number
    token_symbol: string
    type: 'payment' | 'refund' | 'earning'
    status: 'pending' | 'completed' | 'failed'
    tx_hash: string | null
    metadata: any
    created_at: string
    updated_at: string
}

// Helper for status colors (reused)
const getStatusColor = (status: string) => {
    switch (status) {
        case "completed":
            return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
        case "failed":
            return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
        case "pending":
            return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"
        default:
            return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case "completed":
            return <CheckCircle2 className="h-5 w-5 text-green-500" />
        case "failed":
            return <XCircle className="h-5 w-5 text-red-500" />
        case "pending":
            return <Clock className="h-5 w-5 text-yellow-500" />
        default:
            return <Clock className="h-5 w-5 text-gray-500" />
    }
}

export default async function TransactionIdPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const { data: transaction, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single<Transaction>()

    if (error || !transaction) {
        console.error("Error fetching transaction:", error)
        notFound()
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl space-y-8">
            <div>
                <Link href="/transactions">
                    <Button variant="ghost" className="pl-0 gap-2 mb-4 hover:pl-2 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Transactions
                    </Button>
                </Link>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
                    <Badge variant="outline" className={`px-3 py-1 flex items-center gap-2 text-base ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="capitalize">{transaction.status}</span>
                    </Badge>
                </div>
                <p className="text-muted-foreground mt-2">
                    ID: <span className="font-mono text-sm">{transaction.id}</span>
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                                <div className="text-2xl font-bold">
                                    {Number(transaction.amount).toLocaleString()} <span className="text-muted-foreground text-lg">{transaction.token_symbol}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Type</span>
                                <div className="capitalize text-lg font-medium">{transaction.type}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Date</span>
                                <div className="text-lg font-medium">{format(new Date(transaction.created_at), "PPP p")}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Entities
                        </CardTitle>
                        <CardDescription>Involved parties in this transaction</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 font-mono text-xs break-all">
                                {transaction.wallet_address}
                                <ExternalLink className="h-3 w-3 flex-shrink-0 cursor-pointer opacity-50 hover:opacity-100" />
                            </div>
                        </div>

                        {transaction.agent_id && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Agent ID</label>
                                    <div className="p-2 rounded-md bg-muted/50 font-mono text-xs break-all">
                                        {transaction.agent_id}
                                    </div>
                                </div>
                            </>
                        )}

                        {transaction.task_id && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Task ID</label>
                                    <div className="p-2 rounded-md bg-muted/50 font-mono text-xs break-all">
                                        {transaction.task_id}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Hash className="h-5 w-5" />
                            On-Chain Data
                        </CardTitle>
                        <CardDescription>Blockchain verification details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                            {transaction.tx_hash ? (
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 font-mono text-xs break-all">
                                    {transaction.tx_hash}
                                    <ExternalLink className="h-3 w-3 flex-shrink-0 cursor-pointer opacity-50 hover:opacity-100" />
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground italic">Not available</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileJson className="h-5 w-5" />
                                Metadata
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-[300px]">
                                {JSON.stringify(transaction.metadata, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
