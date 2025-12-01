# GraphQL Integration Fix - Technical Documentation

## Problem Summary

The Linot card game GraphQL integration was failing with the error:
```json
{"errors":[{"message":"Field \"chainId\" argument \"owner\" of type \"QueryRoot\" is required but not provided"}]}
```

## Root Causes Discovered

### 1. **Wrong GraphQL Endpoint URL**

**Issue:**
- `run.bash` was setting `VITE_GRAPHQL_URL=http://localhost:8080`
- This is the **CHAIN endpoint**, not the **APPLICATION endpoint**

**Why This Failed:**
- Linera has TWO separate GraphQL endpoints:
  - **Chain Endpoint**: `http://localhost:8080` (Linera's default schema)
  - **Application Endpoint**: `http://localhost:8080/chains/{CHAIN_ID}/applications/{APP_ID}` (Custom service.rs schema)

- Chain endpoint queries (chainId, version, currentCommittee) require an `owner` parameter
- Application endpoint queries (status, config, deckSize) don't require owner - they use your custom service.rs schema

**Example Error:**
```bash
# WRONG:
curl http://localhost:8080 -d '{"query": "{chainId}"}'
# Error: Field "chainId" argument "owner" required

# CORRECT:
curl http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID -d '{"query": "{ status }"}'
# Success: {"data":{"status":"WAITING"}}
```

### 2. **Frontend Missing GraphQL Client**

**Issue:**
- `frontend/package.json` had NO GraphQL client library
- No @linera/client (official Linera library)
- No Apollo Client (alternative for chain queries)
- No integration code at all

**Impact:**
- Frontend couldn't communicate with backend
- No way to query game state
- No way to trigger mutations (playCard, drawCard)

### 3. **Backend Missing Mutations**

**Issue:**
- `backend/src/service.rs` only implemented `QueryRoot`
- Used `EmptyMutation` placeholder
- No way for frontend to trigger game actions

**Impact:**
- Users can see game state but can't play
- No startMatch, playCard, drawCard mutations
- Read-only application

## Solutions Implemented

### 1. Fixed `run.bash` GraphQL URL

**Changed Line 33:**
```bash
# BEFORE:
VITE_GRAPHQL_URL=http://localhost:8080

# AFTER:
VITE_GRAPHQL_URL=http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID
```

**Also added separate chain endpoint:**
```bash
VITE_CHAIN_GRAPHQL_URL=http://localhost:8080
```

Now frontend can query:
- Application state via `VITE_GRAPHQL_URL` (game queries)
- Chain state via `VITE_CHAIN_GRAPHQL_URL` (balance, version, etc.)

### 2. Created Frontend GraphQL Client

**File:** `frontend/src/lib/lineraClient.ts`

**Features:**
- Singleton client for consistency
- Type-safe GraphQL queries
- Error handling with meaningful messages
- Separate methods for each query:
  - `getConfig()` - Match configuration
  - `getMatchState()` - Full game state
  - `getStatus()` - Just status
- Placeholder methods for mutations (to be implemented)

**Usage Example:**
```typescript
import { lineraClient } from './lib/lineraClient';

// Query game state
const state = await lineraClient.getMatchState();
console.log('Status:', state.status);
console.log('Top Card:', state.topCard);

// Get configuration
const config = await lineraClient.getConfig();
console.log('Max Players:', config.maxPlayers);
```

### 3. Created GraphQL Test Script

**File:** `test-graphql.bash`

**Tests:**
1. Endpoint accessibility check
2. Status query test
3. Configuration query test
4. Deck size query test
5. Top card query test
6. Wrong endpoint test (demonstrates the error)

**Run it:**
```bash
./test-graphql.bash
```

## Linera GraphQL Architecture

### Understanding the Two Endpoints

**Chain Endpoint** (`http://localhost:8080`):
- Default Linera schema
- Queries: chainId, version, currentCommittee, blocks, applications
- Requires `owner` parameter for most queries
- Managed by Linera core, not your service.rs

**Application Endpoint** (`http://localhost:8080/chains/{CHAIN_ID}/applications/{APP_ID}`):
- Custom schema from your service.rs
- Queries: Whatever you define in QueryRoot
- Mutations: Whatever you define in MutationRoot
- No owner parameter needed (handled by Linera authentication)

### Correct GraphQL Patterns

**Query Application State:**
```bash
curl "$VITE_GRAPHQL_URL" -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "query { status deckSize topCard { suit rank } }"}'
```

**Query Chain State:**
```bash
curl "http://localhost:8080" -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "query { chainId(owner: \"$OWNER_ADDRESS\") }"}'
```

## Comparison with Inspiration Codebases

### lineraodds-main Strategy

**Their Setup:**
- Uses Vue.js + Apollo Client
- Apollo points to Linera testnet API: `https://api.testnet-conway.linera.net/graphql`
- Uses `@linera/client` for application-specific queries
- Runs separate service on port 8081

**Their Pattern:**
```typescript
// stores/app.ts
const client = await new linera.Client(wallet);
const backend = await client.frontend().application(APP_ID);
const response = await backend.query('{ "query": "..." }');
```

**Key Insight:**
They use BOTH:
- Apollo for chain queries (testnet API)
- @linera/client for application queries

### Our Approach (Simpler)

**Our Setup:**
- React + TypeScript
- Simple fetch-based client (no Apollo dependency)
- Direct GraphQL POST requests
- Single service on port 8080

**Why Simpler:**
- No need for external testnet during development
- Judges can test fully locally
- Less dependencies = easier deployment
- Direct fetch is more transparent

## Current Service.rs Schema

### Queries (Implemented ✅)

```graphql
type Query {
  config: MatchConfig
  status: MatchStatus
  currentPlayerIndex: Int
  currentPlayer: AccountOwner
  topCard: Card
  deckSize: Int
  activeShapeDemand: CardSuit
  pendingPenalty: Int
  players: [PublicPlayer]
  playerView(player: AccountOwner): PlayerView
  winner: AccountOwner
  bettingPoolTotal: Int
}
```

### Mutations (Not Implemented ❌)

**Needed:**
```graphql
type Mutation {
  startMatch: Boolean
  playCard(cardIndex: Int!, chosenSuit: String): Boolean
  drawCard: Boolean
  callLastCard: Boolean
  joinMatch(nickname: String!): Boolean
}
```

**Implementation Required:**
1. Create `MutationRoot` struct in service.rs
2. Add `ServiceRuntime` to MutationRoot (for calling operations)
3. Replace `EmptyMutation` with `MutationRoot` in schema builder
4. Implement each mutation method

## Next Steps

### Immediate (Required for Gameplay)

1. **Add MutationRoot to service.rs**
   - [ ] Create MutationRoot struct with runtime
   - [ ] Implement startMatch mutation
   - [ ] Implement playCard mutation
   - [ ] Implement drawCard mutation
   - [ ] Replace EmptyMutation in schema

2. **Update Frontend Client**
   - [ ] Implement mutation methods in lineraClient.ts
   - [ ] Add error handling for mutations
   - [ ] Add loading states

3. **Test End-to-End**
   - [ ] Start match via GraphQL
   - [ ] Play cards via GraphQL
   - [ ] Draw cards via GraphQL
   - [ ] Verify state updates

### Medium Priority (UX Enhancements)

4. **Add GraphQL Subscriptions**
   - [ ] Subscribe to match state changes
   - [ ] Real-time card plays
   - [ ] Turn notifications

5. **Optimize Queries**
   - [ ] Batch queries where possible
   - [ ] Add query result caching
   - [ ] Minimize polling frequency

### Optional (Advanced Features)

6. **Use @linera/client Library**
   - Currently using simple fetch
   - Could upgrade to official library for advanced features
   - Provides wallet integration, notifications, etc.

7. **Add Apollo Client**
   - For chain-level queries
   - Better caching and dev tools
   - Only if needed for complex queries

## Testing the Fix

### Before Running Tests

1. Deploy the application:
   ```bash
   sudo docker compose up --build
   ```

2. Wait for "READY!" message in logs

3. Check .env.local was generated:
   ```bash
   cat frontend/.env.local
   ```

### Run Automated Tests

```bash
./test-graphql.bash
```

**Expected Output:**
```
✅ Endpoint is accessible
✅ Status query successful!
✅ Config query successful!
✅ Deck size query successful!
✅ Top card query successful!
✅ Correctly fails at chain endpoint (as expected)
```

### Manual Testing

**Test Queries:**
```bash
source frontend/.env.local

# Status
curl "$VITE_GRAPHQL_URL" -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ status }"}'

# Configuration
curl "$VITE_GRAPHQL_URL" -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ config { maxPlayers cardsPerPlayer } }"}'

# Full state
curl "$VITE_GRAPHQL_URL" -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ status deckSize topCard { suit rank } currentPlayerIndex }"}'
```

## Key Learnings

### 1. Linera Has Two GraphQL Schemas

- Chain schema (default Linera queries)
- Application schema (your custom service.rs)
- Don't mix them up!

### 2. Frontend Libraries Are Optional

- @linera/client is official but not required
- Simple fetch works fine for basic queries
- Apollo Client is for advanced use cases

### 3. Endpoint Structure Matters

- Always include full path: `/chains/{CHAIN_ID}/applications/{APP_ID}`
- Base URL alone won't work
- Test with correct endpoint first!

### 4. Service.rs Must Handle Mutations

- QueryRoot alone isn't enough
- Need MutationRoot for write operations
- EmptyMutation is just a placeholder

## References

- Linera Documentation: https://linera.dev/developers/backend/service.html
- GraphQL Spec: https://spec.graphql.org/
- Inspiration: lineraodds-main (Vue + @linera/client + Apollo)
- Our Implementation: React + Fetch + Simple Client

## Summary

**Problem:** Wrong endpoint URL, missing frontend client, no mutations

**Solution:** 
1. Fixed endpoint to include chain and app IDs
2. Created lineraClient.ts for queries
3. Created test-graphql.bash for validation
4. Documented the two-endpoint architecture

**Result:** GraphQL queries now work correctly!

**Remaining:** Add MutationRoot to service.rs for gameplay actions
