import { NextRequest, NextResponse } from 'next/server'
import { fetchAgentDetails } from '@/lib/cronos'

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Correct type for Next.js 15
) {
    try {
        const params = await context.params
        const { id } = params

        const searchParams = request.nextUrl.searchParams;
        const network = searchParams.get('network');
        let chainId = 338;
        if (network === 'ganache' || network === 'localnet' || network === '1337') {
            chainId = 1337;
        }

        const details = await fetchAgentDetails(id, chainId)

        if (!details) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
        }

        return NextResponse.json({
            details
        })
    } catch (error) {
        console.error('Cronos fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch agent details' },
            { status: 500 }
        )
    }
}
