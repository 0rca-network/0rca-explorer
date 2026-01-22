import { NextRequest, NextResponse } from 'next/server'
import { fetchTransactions, getPublicClient } from '@/lib/cronos'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const network = searchParams.get('network');
    let chainId = 338;
    if (network === 'ganache' || network === 'localnet' || network === '1337') {
      chainId = 1337;
    }

    const client = await getPublicClient(chainId);
    const blockHeight = await client.getBlockNumber();
    const transactions = await fetchTransactions(chainId);
    console.log(`API [GET /api/transactions]: Fetched ${transactions.length} txs for chain ${chainId}`);

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