import { NextRequest, NextResponse } from 'next/server'
import { fetchTransactions, getPublicClient } from '@/lib/avalanche'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const chainId = 43112; // Avalanche Subnet
    const client = await getPublicClient(chainId);
    const blockHeight = await client.getBlockNumber();
    const transactions = await fetchTransactions(chainId);

    return NextResponse.json({
      transactions,
      blockHeight: blockHeight.toString(),
      nextToken: null
    })
  } catch (error) {
    console.error('API [GET /api/transactions] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}