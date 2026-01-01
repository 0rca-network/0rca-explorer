import { NextRequest, NextResponse } from 'next/server'
import { fetchTransactions } from '@/lib/cronos'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const transactions = await fetchTransactions();

    return NextResponse.json({
      transactions,
      nextToken: null
    })
  } catch (error) {
    console.error('Cronos fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}