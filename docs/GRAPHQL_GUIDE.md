# Linot GraphQL API Guide

This guide covers how to interact with the Linot card game backend via GraphQL queries and mutations.

## Overview

Linot uses async-graphql to expose a real-time GraphQL API for querying game state and executing game operations. The service runs alongside your deployed Linera application.

**Key Features:**

- Real-time game state queries
- Player-specific views (secure card visibility)
- Public match information
- Mutation support for game operations

---

## Setup

### 1. Deploy the Application

Follow the [deployment_local_guide.md](./deployment_local_guide.md) to deploy Linot to your local Linera network.

### 2. Start the GraphQL Service

After deployment, start the service:

```bash
# Export environment variables (from linera net up) - Don't use these directly
export LINERA_WALLET="/tmp/.tmpXXXXX/wallet_0.json"
export LINERA_KEYSTORE="/tmp/.tmpXXXXX/keystore_0.json"
export LINERA_STORAGE="rocksdb:/tmp/.tmpXXXXX/client_0.db"

# Start service on port 8080
linera service --port 8080
```

The GraphQL endpoint will be available at:

```
http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID>
```

### 3. Get Your Chain ID and Application ID

```bash
# View your wallet details
linera wallet show

# Copy your default chain ID (starts with 'e476...')
# Copy your application ID from deployment output
```

---

## GraphQL Endpoint Structure

```
POST http://localhost:8080/chains/{chainId}/applications/{appId}
Content-Type: application/json

{
  "query": "YOUR_GRAPHQL_QUERY_HERE"
}
```

**Example URL:**

```
http://localhost:8080/chains/e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595ceb86f5a8e77e060000000000000000/applications/e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595ceb86f5a8e77e060000000000000001000000e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595ceb86f5a8e77e060000000000000000
```

---

## Available Queries

### 1. Get Match Configuration

Returns the match settings (max players, ranked mode, etc.)

```graphql
query {
  config {
    maxPlayers
    isRanked
    strictMode
    host
  }
}
```

**Response:**

```json
{
  "data": {
    "config": {
      "maxPlayers": 2,
      "isRanked": false,
      "strictMode": false,
      "host": null
    }
  }
}
```

---

### 2. Get Match Status

Returns current match state (Waiting, Active, Finished)

```graphql
query {
  status
}
```

**Possible Values:** `WAITING`, `ACTIVE`, `FINISHED`

**Response:**

```json
{
  "data": {
    "status": "ACTIVE"
  }
}
```

---

### 3. Get Current Player

Returns the AccountOwner of whose turn it is

```graphql
query {
  currentPlayer
  currentPlayerIndex
}
```

**Response:**

```json
{
  "data": {
    "currentPlayer": "User:b526710d57a52f883c9c2f61d06c2c7e560437fd04f4a6844029b4ffc2accd94",
    "currentPlayerIndex": 0
  }
}
```

---

### 4. Get Top Card (Discard Pile)

Returns the current card on top of the discard pile

```graphql
query {
  topCard {
    suit
    value
  }
}
```

**Response:**

```json
{
  "data": {
    "topCard": {
      "suit": "CIRCLE",
      "value": 5
    }
  }
}
```

**Suits:** `CIRCLE`, `TRIANGLE`, `CROSS`, `SQUARE`, `STAR`
**Values:** 1-14 (11=Whot, 12=Pick Two, 13=Pick Three, 14=other special cards)

---

### 5. Get Deck Size

Returns number of cards remaining in the draw pile

```graphql
query {
  deckSize
}
```

**Response:**

```json
{
  "data": {
    "deckSize": 35
  }
}
```

---

### 6. Get Active Shape Demand

Returns the suit demanded by a Whot card (if active)

```graphql
query {
  activeShapeDemand
}
```

**Response:**

```json
{
  "data": {
    "activeShapeDemand": "TRIANGLE"
  }
}
```

---

### 7. Get Pending Penalty

Returns stacked penalty cards from Pick Two/Pick Three

```graphql
query {
  pendingPenalty
}
```

**Response:**

```json
{
  "data": {
    "pendingPenalty": 4
  }
}
```

---

### 8. Get All Players (Public Info)

Returns all players with card counts (cards hidden)

```graphql
query {
  players {
    owner
    nickname
    cardCount
    isActive
    calledLastCard
  }
}
```

**Response:**

```json
{
  "data": {
    "players": [
      {
        "owner": "User:b526710d57a52f883c9c2f61d06c2c7e560437fd04f4a6844029b4ffc2accd94",
        "nickname": "Player 1",
        "cardCount": 5,
        "isActive": true,
        "calledLastCard": false
      },
      {
        "owner": "User:a123456789abcdef...",
        "nickname": "Player 2",
        "cardCount": 7,
        "isActive": true,
        "calledLastCard": true
      }
    ]
  }
}
```

---

### 9. Get Player View (Secure - Your Cards Only)

**IMPORTANT:** Use this for production. It shows your cards but hides opponent cards.

```graphql
query {
  playerView(player: "User:YOUR_ACCOUNT_OWNER_HERE") {
    myCards {
      suit
      value
    }
    myCardCount
    calledLastCard
    opponents {
      owner
      nickname
      cardCount
      isActive
      calledLastCard
    }
    topCard {
      suit
      value
    }
    deckSize
    currentPlayerIndex
    status
    activeShapeDemand
    pendingPenalty
    winnerIndex
  }
}
```

**Response:**

```json
{
  "data": {
    "playerView": {
      "myCards": [
        { "suit": "CIRCLE", "value": 3 },
        { "suit": "TRIANGLE", "value": 7 },
        { "suit": "STAR", "value": 11 }
      ],
      "myCardCount": 3,
      "calledLastCard": false,
      "opponents": [
        {
          "owner": "User:a123...",
          "nickname": "Player 2",
          "cardCount": 5,
          "isActive": true,
          "calledLastCard": true
        }
      ],
      "topCard": { "suit": "SQUARE", "value": 8 },
      "deckSize": 30,
      "currentPlayerIndex": 0,
      "status": "ACTIVE",
      "activeShapeDemand": null,
      "pendingPenalty": 0,
      "winnerIndex": null
    }
  }
}
```

---

### 10. Get Winner

Returns the winner's AccountOwner (if match finished)

```graphql
query {
  winner
}
```

**Response:**

```json
{
  "data": {
    "winner": "User:b526710d57a52f883c9c2f61d06c2c7e560437fd04f4a6844029b4ffc2accd94"
  }
}
```

---

### 11. Get Betting Pool Total (Wave 4-5)

Returns total amount in betting pool (future feature)

```graphql
query {
  bettingPoolTotal
}
```

**Response:**

```json
{
  "data": {
    "bettingPoolTotal": 0
  }
}
```

---

### 12. Get Full Match State (Debug Only)

**WARNING:** This exposes ALL player cards. Use only for debugging/admin views.

```graphql
query {
  matchState {
    players {
      owner
      nickname
      cards {
        suit
        value
      }
      cardCount
      isActive
      calledLastCard
    }
    deck {
      suit
      value
    }
    discardPile {
      suit
      value
    }
    currentPlayerIndex
    status
    activeShapeDemand
    pendingPenalty
    winnerIndex
    createdAt
  }
}
```

---

## Example: Complete Game Flow Query

Combine multiple queries to get full game context:

```graphql
query GameState($player: AccountOwner!) {
  status
  currentPlayerIndex
  currentPlayer
  topCard {
    suit
    value
  }
  deckSize
  activeShapeDemand
  pendingPenalty
  playerView(player: $player) {
    myCards {
      suit
      value
    }
    myCardCount
    calledLastCard
    opponents {
      nickname
      cardCount
      calledLastCard
    }
  }
  winner
}
```

**Variables:**

```json
{
  "player": "User:b526710d57a52f883c9c2f61d06c2c7e560437fd04f4a6844029b4ffc2accd94"
}
```

---

## Testing with cURL

### Example 1: Get Match Status

```bash
curl -X POST http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { status }"
  }'
```

### Example 2: Get Player View

```bash
curl -X POST http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { playerView(player: \"User:b526710d57a52f883c9c2f61d06c2c7e560437fd04f4a6844029b4ffc2accd94\") { myCards { suit value } opponents { nickname cardCount } } }"
  }'
```

### Example 3: Get Top Card and Current Player

```bash
curl -X POST http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { topCard { suit value } currentPlayer currentPlayerIndex }"
  }'
```

---

## GraphQL Playground (Browser)

For interactive testing, open your browser to:

```
http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID>
```

Most GraphQL implementations provide an in-browser IDE for building queries.

---

## Mutations (Game Operations)

Mutations execute game operations. These are defined in your contract's `Operation` enum and trigger on-chain state changes.

**Note:** Mutations are executed through Linera's transaction system, not directly via GraphQL. Use the `linera` CLI or SDK to submit operations:

```bash
linera execute-operation \
  --application-id <APP_ID> \
  --operation '{"JoinMatch": {"nickname": "Player1"}}'
```

See [GRAPHQL_API.md](../GRAPHQL_API.md) for mutation details.

---

## Frontend Integration

### React Example with fetch

```typescript
const GRAPHQL_ENDPOINT = `http://localhost:8080/chains/${chainId}/applications/${appId}`;

async function getPlayerView(playerAccount: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetPlayerView($player: AccountOwner!) {
          playerView(player: $player) {
            myCards { suit value }
            opponents { nickname cardCount }
            topCard { suit value }
            status
          }
        }
      `,
      variables: { player: playerAccount }
    })
  });
  
  const { data } = await response.json();
  return data.playerView;
}
```

### Using Apollo Client

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: `http://localhost:8080/chains/${chainId}/applications/${appId}`,
  cache: new InMemoryCache()
});

const GET_PLAYER_VIEW = gql`
  query GetPlayerView($player: AccountOwner!) {
    playerView(player: $player) {
      myCards { suit value }
      opponents { nickname cardCount }
      topCard { suit value }
    }
  }
`;

const { data } = await client.query({
  query: GET_PLAYER_VIEW,
  variables: { player: userAccount }
});
```

---

## Real-Time Updates with Polling

Since GraphQL subscriptions aren't fully supported yet, use polling for real-time updates:

```typescript
// Poll every 500ms for game updates
useEffect(() => {
  const interval = setInterval(async () => {
    const gameState = await fetchGameState(playerAccount);
    setGameState(gameState);
  }, 500);
  
  return () => clearInterval(interval);
}, [playerAccount]);
```

**Recommendation:** Poll `playerView` and `status` for live game updates.

---

## Security Considerations

1. **Always use `playerView`** in production to prevent card leakage
2. **Don't expose `matchState`** query to untrusted clients
3. **Validate AccountOwner** strings to prevent injection
4. **Rate limit** GraphQL endpoints in production

---

## Troubleshooting

### "Application not found"

- Verify your CHAIN_ID and APP_ID are correct
- Ensure the service is running with correct environment variables

### "Query returned null"

- Check if the match has been created/started
- Verify the player AccountOwner exists in the match

### "Connection refused"

- Ensure `linera service --port 8080` is running
- Check firewall settings

### "Invalid AccountOwner format"

- Format must be: `"User:hexstring"` or `"Chain:hexstring"`
- No `0x` prefix in hex strings

---

## Performance Tips

1. **Batch queries** - Combine multiple fields in one request
2. **Request only needed fields** - Smaller payloads = faster responses
3. **Cache responses** - Game state doesn't change until operations execute
4. **Use player-specific views** - More efficient than full match state

---

## Next Steps

- See [deployment_local_guide.md](./deployment_local_guide.md) for deployment
- See [GRAPHQL_API.md](../GRAPHQL_API.md) for mutation operations
- See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details

---

Built with async-graphql 7.0 and Linera SDK 0.15.4
