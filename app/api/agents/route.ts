import { NextRequest, NextResponse } from 'next/server'
import { fetchAgents } from '@/lib/cronos'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const network = searchParams.get('network');
    let chainId = 338;
    if (network === 'ganache' || network === 'localnet' || network === '1337') {
      chainId = 1337;
    }

    const agents = await fetchAgents(chainId);

    return NextResponse.json({
      count: agents.length,
      agents: agents
    })
  } catch (error) {
    console.error('Cronos fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}