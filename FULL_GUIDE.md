# ORCA AI Agents Explorer Cronos - Full Project Guide

## Project Overview
A Next.js 15 application for exploring AI agents on the Cronos blockchain. Features a dark theme with network switching capabilities between TestNet and MainNet.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Fonts**: Geist Sans & Mono
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics

## Project Structure

### Core Files
```
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Dashboard page
│   ├── globals.css              # Global styles & CSS variables
│   ├── agents/
│   │   ├── page.tsx            # Agents listing page
│   │   └── [id]/page.tsx       # Individual agent details
│   └── transactions/
│       └── page.tsx            # Transactions listing page
├── components/
│   ├── ui/                     # shadcn/ui components (40+ components)
│   ├── header.tsx              # Main navigation with theme & network toggle
│   ├── network-info.tsx        # Network status bar
│   ├── search-bar.tsx          # Global search component
│   └── pagination.tsx          # Pagination component
├── contexts/
│   └── network-context.tsx     # Network state management (TestNet/MainNet)
├── hooks/                      # Custom React hooks
├── lib/
│   └── utils.ts               # Utility functions (cn, etc.)
└── public/                    # Static assets
```

## Key Features

### 1. Network Switching
- **Context**: `contexts/network-context.tsx` manages global network state
- **UI**: Dropdown in header allows switching between TestNet/MainNet
- **Dynamic Data**: Network info updates App IDs, Asset IDs based on selection

### 2. Navigation Structure
- **Dashboard** (`/`): Overview with stats, network status
- **Agents** (`/agents`): List/grid view of AI agents with search/pagination
- **Agent Details** (`/agents/[id]`): Individual agent information
- **Transactions** (`/transactions`): Transaction history with search/pagination

### 3. Search & Pagination
- **Global Search**: Works across agents and transactions
- **URL State**: Search queries and pagination persist in URL
- **Responsive**: List/grid view toggle for better UX

### 4. Theme System
- **Dark Theme**: Primary theme with pure black background
- **CSS Variables**: Extensive color system using oklch color space
- **Theme Toggle**: Light/dark mode switching in header

## Component Architecture

### Layout Components
- **Header**: Navigation, network selector, theme toggle
- **NetworkInfo**: Dynamic network information bar
- **SearchBar**: Global search with URL state management

### Page Components
- **Dashboard**: Stats cards, network status visualization
- **Agents List**: Filterable agent grid/list with pagination
- **Agent Detail**: Comprehensive agent information display
- **Transactions**: Transaction history with external links

### UI Components (shadcn/ui)
Complete set of 40+ components including:
- Form controls (Input, Select, Button, etc.)
- Layout (Card, Sheet, Dialog, etc.)
- Data display (Table, Badge, Avatar, etc.)
- Navigation (Pagination, Breadcrumb, etc.)

## Data Structure

### Mock Data
- **Agents**: 10 sample AI agents with status, transactions, metadata
- **Transactions**: 12 sample blockchain transactions with links to AlgoExplorer
- **Network Configs**: TestNet/MainNet with different App/Asset IDs

### State Management
- **Network Context**: Global network selection state
- **URL State**: Search queries and pagination via Next.js router
- **Local State**: Theme preference, view modes (list/grid)

## Styling System

### Tailwind Configuration
- **Version**: Tailwind CSS v4
- **Custom Colors**: Extensive color palette using oklch
- **Typography**: Geist font family integration
- **Animations**: Custom animations for loading states

### Design Tokens
- **Background**: Pure black (`oklch(0.08 0 0)`)
- **Foreground**: Near white (`oklch(0.985 0 0)`)
- **Accent Colors**: Blue, emerald, purple variants
- **Border Radius**: Consistent 0.75rem default

## Development Setup

### Scripts
```json
{
  "dev": "next dev",
  "build": "next build", 
  "start": "next start",
  "lint": "next lint"
}
```

### Key Dependencies
- **React 19**: Latest React with concurrent features
- **Next.js 15**: App Router, server components
- **Radix UI**: Accessible component primitives
- **Class Variance Authority**: Component variant management
- **Lucide React**: Icon library

## Configuration Files

### Next.js Config
- **ESLint**: Disabled during builds
- **TypeScript**: Build errors ignored
- **Images**: Unoptimized for static export

### Component Config
- **Style**: New York variant
- **RSC**: React Server Components enabled
- **Path Aliases**: Absolute imports configured

## Network Integration

### Cronos Integration
- **TestNet**: Default network with test App/Asset IDs
- **MainNet**: Production network configuration
- **External Links**: AlgoExplorer integration for transaction viewing

### Future Extensibility
- **API Integration**: Ready for real blockchain data
- **Wallet Connection**: Structure supports wallet integration
- **Real-time Updates**: WebSocket integration possible

## Performance Considerations
- **Server Components**: Extensive use for better performance
- **Static Generation**: Pages optimized for static export
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Configured for deployment flexibility

This project provides a solid foundation for a blockchain explorer with modern React patterns, comprehensive UI components, and extensible architecture for real Cronos integration.