# Database Setup Guide - Updated

## Overview
This project uses PostgreSQL with Prisma ORM. The database has 4 main tables for network-specific data storage.

## Database Schema

### Tables Structure

#### 1. network_configs
```sql
CREATE TABLE "network_configs" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "smartContractAppID" TEXT NOT NULL
);
```

#### 2. agents_testnet
```sql
CREATE TABLE "agents_testnet" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "creatorName" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB DEFAULT '{}'
);
```

#### 3. agents_mainnet
```sql
CREATE TABLE "agents_mainnet" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "creatorName" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB DEFAULT '{}'
);
```

#### 4. transactions_testnet
```sql
CREATE TABLE "transactions_testnet" (
  "id" SERIAL PRIMARY KEY,
  "transactionId" TEXT UNIQUE NOT NULL,
  "timestamp" TIMESTAMP DEFAULT NOW(),
  "transactionType" TEXT NOT NULL,
  "network" TEXT DEFAULT 'testnet'
);
```

#### 5. transactions_mainnet
```sql
CREATE TABLE "transactions_mainnet" (
  "id" SERIAL PRIMARY KEY,
  "transactionId" TEXT UNIQUE NOT NULL,
  "timestamp" TIMESTAMP DEFAULT NOW(),
  "transactionType" TEXT NOT NULL,
  "network" TEXT DEFAULT 'mainnet'
);
```

## Setup Instructions

### 1. Update Environment Variables
Ensure your `.env` file has the correct database password:
```env
DATABASE_URL="postgresql://postgres.vbvqakiuprnrgbdlirrl:[YOUR-ACTUAL-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.vbvqakiuprnrgbdlirrl:[YOUR-ACTUAL-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

### 2. Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npm run db:seed

# View database in browser
npx prisma studio
```

## API Endpoints

### GET /api/agents?network=testnet
Returns agents from testnet database.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Test_Agent_01",
    "description": "Price oracle agent for testnet",
    "creatorName": "ORCA Team",
    "createdAt": "2024-12-15T10:30:00.000Z",
    "metadata": {}
  }
]
```

### GET /api/agents?network=mainnet
Returns agents from mainnet database.

### GET /api/transactions?network=testnet
Returns transactions from testnet database.

**Response:**
```json
[
  {
    "id": 1,
    "transactionId": "KKSJ3BSN5V3KTAFFDQWOBL324KQJQFUNUFKOFXUSVTK6UK72HYLA",
    "timestamp": "2024-12-15T10:30:00.000Z",
    "transactionType": "appl",
    "network": "testnet"
  }
]
```

### GET /api/transactions?network=mainnet
Returns transactions from mainnet database.

## Cronos Transaction Types
The system supports these Cronos transaction types:
- `appl` - Application call
- `axfer` - Asset transfer
- `acfg` - Asset configuration
- `pay` - Payment
- `keyreg` - Key registration
- `afrz` - Asset freeze

## Manual Database Setup (if automated setup fails)

If you encounter connection issues, you can manually create the tables using SQL:

```sql
-- Create all tables
CREATE TABLE "network_configs" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "smartContractAppID" TEXT NOT NULL
);

CREATE TABLE "agents_testnet" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "creatorName" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB DEFAULT '{}'
);

CREATE TABLE "agents_mainnet" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "creatorName" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "metadata" JSONB DEFAULT '{}'
);

CREATE TABLE "transactions_testnet" (
  "id" SERIAL PRIMARY KEY,
  "transactionId" TEXT UNIQUE NOT NULL,
  "timestamp" TIMESTAMP DEFAULT NOW(),
  "transactionType" TEXT NOT NULL,
  "network" TEXT DEFAULT 'testnet'
);

CREATE TABLE "transactions_mainnet" (
  "id" SERIAL PRIMARY KEY,
  "transactionId" TEXT UNIQUE NOT NULL,
  "timestamp" TIMESTAMP DEFAULT NOW(),
  "transactionType" TEXT NOT NULL,
  "network" TEXT DEFAULT 'mainnet'
);

-- Insert sample data
INSERT INTO "network_configs" ("name", "smartContractAppID") VALUES 
('testnet', '1234567890'),
('mainnet', '0987654321');

INSERT INTO "agents_testnet" ("name", "description", "creatorName") VALUES 
('Test_Agent_01', 'Price oracle agent for testnet', 'ORCA Team'),
('Test_Agent_02', 'Liquidity monitoring agent', 'DeFi Labs');

INSERT INTO "agents_mainnet" ("name", "description", "creatorName") VALUES 
('Main_Agent_01', 'Production price oracle', 'ORCA Team'),
('Main_Agent_02', 'Production liquidity monitor', 'DeFi Labs');

INSERT INTO "transactions_testnet" ("transactionId", "transactionType") VALUES 
('KKSJ3BSN5V3KTAFFDQWOBL324KQJQFUNUFKOFXUSVTK6UK72HYLA', 'appl'),
('BBTJ3BSN5V3KTAFFDQWOBL324KQJQFUNUFKOFXUSVTK6UK72HYLB', 'pay');

INSERT INTO "transactions_mainnet" ("transactionId", "transactionType") VALUES 
('CCTJ3BSN5V3KTAFFDQWOBL324KQJQFUNUFKOFXUSVTK6UK72HYLC', 'axfer'),
('DDTJ3BSN5V3KTAFFDQWOBL324KQJQFUNUFKOFXUSVTK6UK72HYLD', 'acfg');
```

## Testing API Endpoints

Once the database is set up, test the endpoints:

```bash
# Test agents endpoints
curl "http://localhost:3000/api/agents?network=testnet"
curl "http://localhost:3000/api/agents?network=mainnet"

# Test transactions endpoints
curl "http://localhost:3000/api/transactions?network=testnet"
curl "http://localhost:3000/api/transactions?network=mainnet"
```

## Troubleshooting

1. **Connection Issues**: Verify your database password in `.env`
2. **Schema Issues**: Use `npx prisma db push` instead of migrate
3. **Seed Issues**: Run the manual SQL commands above
4. **API Issues**: Check that the database tables exist and have data