import { NextRequest, NextResponse } from 'next/server'
import { fetchLoggingTransactions } from '@/lib/algorand'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const network = searchParams.get('network')
    const nextToken = searchParams.get('nextToken') || undefined

    if (network === 'mainnet') {
      return NextResponse.json({ transactions: [], nextToken: null })
    }

    // We don't strictly need to fetch agents to get transactions, 
    // but we might want to pass them if we were filtering.
    // For now, just fetch transactions directly.
    const { transactions, nextToken: newNextToken } = await fetchLoggingTransactions([], nextToken);

    return NextResponse.json({
      transactions,
      nextToken: newNextToken
    })
  } catch (error) {
    console.error('Algorand fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}