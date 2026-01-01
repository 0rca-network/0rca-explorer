import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 'cronos-testnet',
      name: 'Cronos Testnet',
      rpcUrl: 'https://evm-t3.cronos.org',
      explorerUrl: 'https://explorer.cronos.org/testnet'
    }
  ])
}