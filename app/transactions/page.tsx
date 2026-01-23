
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { FileText, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

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

// Helper function to shorten address
const shortenAddress = (address: string) => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Helper to format currency
const formatCurrency = (amount: number, symbol: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Assuming everything is usually pegged or displayed as USD for simplicity, or just use raw number
  }).format(amount).replace("$", "") + " " + symbol
}

// Helper for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    case "failed":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    case "pending":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
    default:
      return "bg-gray-500/10 text-gray-500"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "payment":
      return <ArrowUpRight className="h-4 w-4 text-red-400" />
    case "earning":
      return <ArrowDownLeft className="h-4 w-4 text-green-400" />
    case "refund":
      return <RefreshCw className="h-4 w-4 text-blue-400" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export default async function TransactionsPage() {
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Transaction[]>()

  if (error) {
    console.error("Error fetching transactions:", error)
    return (
      <div className="container mx-auto py-10">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Fetching Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          Real-time record of all agent interactions and payments
        </p>
      </div>

      <Card>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Wallet / Agent</TableHead>
                <TableHead>Task ID</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions?.map((tx) => (
                  <TableRow key={tx.id} className="group cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/transactions/${tx.id}`} className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-muted group-hover:bg-background transition-colors">
                          {getTypeIcon(tx.type)}
                        </div>
                        <span className="capitalize font-medium text-foreground/80 group-hover:text-foreground">
                          {tx.type}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/transactions/${tx.id}`}>
                        <Badge variant="outline" className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/transactions/${tx.id}`}>
                        {formatCurrency(Number(tx.amount), tx.token_symbol)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/transactions/${tx.id}`}>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {shortenAddress(tx.wallet_address)}
                          </span>
                          {tx.agent_id && (
                            <span className="text-xs text-muted-foreground">
                              Agent: {tx.agent_id}
                            </span>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/transactions/${tx.id}`}>
                        {tx.task_id ? tx.task_id.slice(0, 8) + "..." : "-"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      <Link href={`/transactions/${tx.id}`}>
                        {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
