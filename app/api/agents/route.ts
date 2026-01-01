import { NextRequest, NextResponse } from 'next/server'
import { fetchAgents } from '@/lib/cronos'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const agents = await fetchAgents();

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