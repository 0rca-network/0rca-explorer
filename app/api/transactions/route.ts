import { NextRequest, NextResponse } from 'next/server'
import { fetchTransactions } from '@/lib/cronos'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const network = searchParams.get('network');
    let chainId = 338;
    if (network === 'ganache' || network === 'localnet' || network === '1337') {
      chainId = 1337;
    }

    const transactions = await fetchTransactions(chainId);

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