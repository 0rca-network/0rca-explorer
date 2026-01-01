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

    let filteredAgents = await fetchAgents(chainId);

    // Filter by Owner
    const owner = searchParams.get('owner');
    if (owner) {
      filteredAgents = filteredAgents.filter(a => a.address.toLowerCase() === owner.toLowerCase());
    }

    // Filter by Reputation (Score)
    const minReputation = searchParams.get('minReputation') || searchParams.get('reputation');
    if (minReputation) {
      filteredAgents = filteredAgents.filter(a => a.reputation.score >= parseInt(minReputation));
    }

    // Filter by Feedback (Count)
    const minFeedback = searchParams.get('minFeedback') || searchParams.get('feedback');
    if (minFeedback) {
      filteredAgents = filteredAgents.filter(a => a.reputation.count >= parseInt(minFeedback));
    }

    // Filter by Verified (Validation Count > 0)
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      filteredAgents = filteredAgents.filter(a => a.validation.count > 0);
    }

    return NextResponse.json({
      count: filteredAgents.length,
      agents: filteredAgents
    })
  } catch (error) {
    console.error('Cronos fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}