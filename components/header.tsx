"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useNetwork } from "@/contexts/network-context"

export function Header() {
  const pathname = usePathname()
  const { network, setNetwork } = useNetwork()

  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Agents", href: "/agents" },
    { name: "Transactions", href: "/transactions" },
  ]

  return (
    <header className="border-b border-border/20 bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/0rca_white.png" 
                alt="Logo" 
                className="h-8 w-8"
              />
                            <span className="text-2xl font-bold tracking-tight">Explorer</span>

            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Select value={network} onValueChange={(value: "testnet" | "mainnet") => setNetwork(value)}>
              <SelectTrigger className="w-32 h-10 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testnet">TestNet</SelectItem>
                <SelectItem value="mainnet">MainNet</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>
      </div>
    </header>
  )
}
