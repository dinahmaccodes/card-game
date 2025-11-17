# Documentation Index - Linot Backend Testing

Complete guide to all testing documentation for the Linot card game backend.

---

## Start Here

### For Quick Testing (10 minutes)

**[TEST_THIS_NOW.md](../TEST_THIS_NOW.md)** **START HERE**

- One-page quick reference
- Copy-paste checklist format
- Minimal explanations, maximum action
- Perfect for: Developers who want to test immediately

**[docs/QUICK_TEST.md](./QUICK_TEST.md)**

- Comprehensive walkthrough
- Detailed explanations for each step
- Expected outputs shown
- Multiple testing options (terminal + browser)
- Perfect for: First-time testers, learning the system

### Understanding Query Responses

**[docs/NULL_RESPONSE_EXPLANATION.md](./NULL_RESPONSE_EXPLANATION.md)** **READ IF CONFUSED ABOUT null**

- Why null/0/[] responses are CORRECT
- How to tell working vs broken queries
- Technical explanation of Linera state initialization
- Demo video strategy guide
- Perfect for: Anyone seeing null and wondering if queries are working

---

## Comprehensive Guides

### [docs/TESTING_BACKEND.md](./TESTING_BACKEND.md)

**Complete deployment and testing reference**

**Contents:**

- Prerequisites with verification commands
- 5-step deployment process
- 5 test queries with expected outputs
- GraphQL query examples
- Performance metrics comparison (Linera vs Ethereum/Polygon/Solana)
- Troubleshooting section
- Technical architecture overview

**Best for:**

- Understanding the full deployment process
- Learning how the backend works
- Performance analysis
- Comprehensive testing scenarios

**Size:** 400+ lines

---

### [docs/GRAPHQL_GUIDE.md](./GRAPHQL_GUIDE.md)

**Complete GraphQL API reference**

**Contents:**

- All 12 query endpoints documented
- Query syntax examples
- cURL command examples
- GraphiQL browser usage
- React/frontend integration examples
- Response schemas with types
- Security considerations
- Rate limiting notes

**Endpoints covered:**

1. `status` - Match status
2. `config` - Match configuration
3. `players` - All players
4. `playerView` - Secure player view
5. `deckSize` - Remaining cards
6. `topCard` - Current table card
7. `currentPlayerIndex` - Active player
8. `turnDirection` - Turn order
9. `pendingPenalty` - Penalty cards
10. `winner` - Match winner
11. `hasEnded` - Match end status
12. `canStartMatch` - Start validation

**Best for:**

- API integration
- Frontend development
- Understanding data structures
- Building custom clients

**Size:** 500+ lines

---

## Troubleshooting

### [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Common issues and fixes**

**Issues covered:**

- Filesystem errors (wrong paths)
- curl hangs (missing env vars)
- Invalid chain ID (wrong IDs)
- Variables JSON error (GraphiQL panel confusion)
- Port conflicts
- WASM target missing
- Linera CLI not found
- Empty GraphQL responses
- AccountOwner deserialization

**Each issue includes:**

- Symptom description
- Root cause
- Step-by-step fix
- Verification command

**Best for:**

- Debugging deployment issues
- Quick problem resolution
- Understanding common pitfalls

---

## Additional Documentation

### [docs/deployment_local_guide.md](./deployment_local_guide.md)

**Original step-by-step deployment guide**

**Contents:**

- Historical deployment steps
- Original testing methodology
- Detailed command explanations

**Status:** Comprehensive but superseded by TESTING_BACKEND.md for most use cases

---

### [docs/details.md](./details.md)

**Testing session notes**

**Contents:**

- Chain IDs and App IDs from testing sessions
- Historical deployment records
- Quick reference for active deployments

**Usage:** Internal testing reference

---

## Which Guide to Use?

### Choose based on your goal:

| Goal                                      | Use This Guide                                                   |
| ----------------------------------------- | ---------------------------------------------------------------- |
| **Test backend RIGHT NOW (fastest)**      | [TEST_THIS_NOW.md](../TEST_THIS_NOW.md)                          |
| **First time testing, want explanations** | [QUICK_TEST.md](./QUICK_TEST.md)                                 |
| **Understand complete system**            | [TESTING_BACKEND.md](./TESTING_BACKEND.md)                       |
| **Build frontend integration**            | [GRAPHQL_GUIDE.md](./GRAPHQL_GUIDE.md)                           |
| **Debug an error**                        | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)                       |
| **Compare performance metrics**           | [TESTING_BACKEND.md](./TESTING_BACKEND.md) (Performance section) |

---

## Testing Workflow

**Recommended sequence for new users:**

1. **[TEST_THIS_NOW.md](../TEST_THIS_NOW.md)** - Quick test (10 min)
2. **[QUICK_TEST.md](./QUICK_TEST.md)** - Understand what happened
3. **[GRAPHQL_GUIDE.md](./GRAPHQL_GUIDE.md)** - Explore all queries
4. **[TESTING_BACKEND.md](./TESTING_BACKEND.md)** - Deep dive

**If you hit issues at any step:**

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🔄 Documentation Status

| Document                  | Status   | Last Updated | Lines |
| ------------------------- | -------- | ------------ | ----- |
| TEST_THIS_NOW.md          | Complete | Nov 2024     | 150+  |
| QUICK_TEST.md             | Complete | Nov 2024     | 400+  |
| TESTING_BACKEND.md        | Complete | Nov 2024     | 400+  |
| GRAPHQL_GUIDE.md          | Complete | Nov 2024     | 500+  |
| TROUBLESHOOTING.md        | Complete | Nov 2024     | 300+  |
| deployment_local_guide.md | Archived | Nov 2024     | 200+  |

**Total documentation:** ~2000 lines

---

## 🎓 Learning Path

### Beginner → Advanced

**Level 1: Get It Running (10 min)**

- [TEST_THIS_NOW.md](../TEST_THIS_NOW.md)

**Level 2: Understand the Basics (30 min)**

- [QUICK_TEST.md](./QUICK_TEST.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Level 3: Master the API (1 hour)**

- [GRAPHQL_GUIDE.md](./GRAPHQL_GUIDE.md)
- Try all 12 query endpoints
- Test in both terminal and browser

**Level 4: Deep System Knowledge (2 hours)**

- [TESTING_BACKEND.md](./TESTING_BACKEND.md)
- Read backend source code
- Understand Linera Views architecture
- Explore game engine logic

---

## Quick Reference

### Essential Commands

```bash
# Build
cargo build --target wasm32-unknown-unknown --release

# Start network
linera net up

# Deploy
linera publish-and-create backend_contract.wasm backend_service.wasm \
  --json-argument '{"max_players": 2, "is_ranked": false, "strict_mode": false}'

# Check IDs
linera wallet show

# Start service
linera service --port 8080

# Test query
curl -X POST "http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { status }"}'
```

### Essential Files

```
backend/target/wasm32-unknown-unknown/release/
├── backend_contract.wasm (261KB)
└── backend_service.wasm (1.4MB)
```

### Essential URLs

```
GraphQL Service: http://localhost:8080
GraphiQL IDE: http://localhost:8080/chains/{CHAIN_ID}/applications/{APP_ID}
```

---

## 🤝 Contributing

Found an issue with documentation?

1. Open issue: https://github.com/dinahmaccodes/linot-card-game/issues
2. Include:
   - Which guide you were using
   - What step failed
   - Error message
   - Your OS/environment

---

## 📱 Documentation Formats

All guides are written in **Markdown** and can be:

- Read on GitHub with formatting
- Read in VS Code with preview
- Converted to PDF with any Markdown-to-PDF tool
- Printed as reference sheets
- Embedded in wikis or documentation sites

---

**Last updated:** November 2024  
**Linera SDK version:** 0.15.4  
**Backend version:** Wave 2 Complete

Built with ❤️ by the Linot team
