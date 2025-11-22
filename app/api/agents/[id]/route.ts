import { NextRequest, NextResponse } from 'next/server'
import { fetchAgentDetails, fetchAgentTasks } from '@/lib/algorand'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id

        // The ID passed here is the App ID (as per our previous change)
        const appId = Number(id);

        if (isNaN(appId)) {
            return NextResponse.json({ error: 'Invalid App ID' }, { status: 400 })
        }

        const [details, tasks] = await Promise.all([
            fetchAgentDetails(appId),
            fetchAgentTasks(appId)
        ])

        return NextResponse.json({
            details,
            tasks
        })
    } catch (error) {
        console.error('Agent details fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch agent details' },
            { status: 500 }
        )
    }
}
