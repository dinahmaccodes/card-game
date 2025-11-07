# Contract Build Guide - Linot Card Game Backend

## Purpose

This guide is for developers who need to build, fix, or extend the Linot smart contract. It explains the current implementation status, known issues, and how to work with Linera SDK 0.15.4.

---

## Current Status

### What's Working

- **Game Engine** (`game_engine.rs`) - compiling

  - Deck creation (61 cards)
  - Deterministic shuffling
  - Move validation logic
  - Special card effects
  - Win condition detection

- **Data Types** (`lib.rs`) - Complete
  - Card structures
  - Operation enums
  - Message types
  - GraphQL derives

### ⚠️ Work in Progress

- **State Management** (`state.rs`) - Needs fixing

  - RootView derive macro issues
  - RegisterView async/sync confusion
  - AccountOwner variant selection

- **Contract Implementation** (`contract.rs`) - Structure complete, needs state fixes

  - Load/save methods need correction
  - All operation handlers implemented
  - Async method calls need adjustment

- **Service** (`service.rs`) - Not yet implemented
  - GraphQL queries planned
  - State filtering for privacy

---

## 🔧 Build Commands

### Basic Build (Debug)

```bash
cd backend
cargo build
```

### Release Build for WASM

```bash
cargo build --release --target wasm32-unknown-unknown
```

Output: `target/wasm32-unknown-unknown/release/backend_contract.wasm`

### Check Without Building

```bash
cargo check
```

### Run Tests

```bash
cargo test
```

### Format Code

```bash
cargo fmt
```

### Lint

```bash
cargo clippy
```

---

## Current Build Errors & Fixes

### **Issue 1: RootView Derive Macro Panicking**

**Error:**

```
error: proc-macro derive panicked
  --> src/state.rs:10:10
   |
10 | #[derive(RootView)]
   |          ^^^^^^^^
   = help: message: called `Result::unwrap()` on an `Err` value
```

**Root Cause:**  
The RootView derive macro expects a specific attribute format but it's not being provided correctly.

**Solution:**  
The `#[view(context = "ViewStorageContext")]` attribute must come BEFORE the struct, not just on the derive line. Correct format:

```rust
#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct LinotState {
    pub config: RegisterView<MatchConfig>,
    pub match_data: RegisterView<MatchData>,
    pub betting_pool: RegisterView<Option<BettingPool>>,
}
```

**Reference:**  
See Microbet's `state.rs`:

```rust
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct NativeFungibleTokenState { ... }
```

---

### **Issue 2: RegisterView Get/Set - Async or Sync?**

**Error:**

```
error[E0277]: `&MatchData` is not a future
   --> src/contract.rs:111:58
    |
111 |         let mut match_data = self.state.match_data.get().await.expect("Failed to get match data");
    |                                                         -^^^^^
```

**Root Cause:**  
Confusion about whether RegisterView methods are async or not.

**Investigation Required:**  
Check Linera SDK 0.15.4 source code:

```bash
# Look at RegisterView implementation
grep -r "impl.*RegisterView" ~/.cargo/registry/src/*/linera-views-0.15.4/
```

**Two Possible Solutions:**

**Option A: If RegisterView.get() is sync (returns reference):**

```rust
// Remove .await
let match_data = self.state.match_data.get();  // Returns &MatchData
let mut match_data_clone = match_data.clone(); // Clone for mutation
// ... modify match_data_clone ...
self.state.match_data.set(match_data_clone);   // No .await
```

**Option B: If RegisterView has async load/save pattern:**

```rust
// Use load_entry/save_entry pattern (if available)
let mut match_data = self.state.match_data.load_entry().await?;
// ... modify match_data ...
match_data.save().await?;
```

**Action:**  
Examine the ChainClashArena project - they use similar patterns:

```rust
// From ChainClashArena's contract.rs
let players = self.state.players.get().await.expect("Failed to get players");
```

This suggests `.get()` IS async in their version. Check if they're using a different Linera version.

---

### **Issue 3: AccountOwner Variant Selection**

**Error:**

```
error[E0599]: no method named `chain` found for `AccountOwner`
  --> src/state.rs:40:33
   |
40 |             host: AccountOwner::chain(Default::default()),
   |                                 ^^^^^ method not found
```

**Root Cause:**  
AccountOwner enum structure changed between SDK versions.

**Solution:**  
Check AccountOwner definition in SDK 0.15.4:

```bash
# Find AccountOwner definition
grep -A 10 "pub enum AccountOwner" ~/.cargo/registry/src/*/linera-base-0.15.4/src/identifiers.rs
```

**Expected Structure:**

```rust
pub enum AccountOwner {
    CHAIN,  // Constant, not a variant
    // OR
    Chain,  // Variant
    User(Owner),
    Application { chain_id: ChainId, application_id: ApplicationId },
}
```

**Fix:**  
Use the CHAIN constant:

```rust
impl Default for MatchConfig {
    fn default() -> Self {
        Self {
            max_players: 2,
            host: AccountOwner::CHAIN,  // Use constant
            is_ranked: false,
            strict_mode: false,
        }
    }
}
```

---

### **Issue 4: Load and Save Methods Missing**

**Error:**

```
error[E0599]: no function or associated item named `load` found for struct `LinotState`
```

**Root Cause:**  
RootView trait not properly implemented due to derive macro failure.

**Solution:**  
Once RootView derives correctly, these methods will be auto-generated:

- `LinotState::load(context) -> impl Future<Output = Self>`
- `self.save() -> impl Future<Output = ()>`

**Temporary Workaround:**  
If RootView continues to fail, implement View trait manually:

```rust
use linera_sdk::views::{View, ViewStorageContext};

impl View<ViewStorageContext> for LinotState {
    async fn load(context: ViewStorageContext) -> Result<Self, linera_sdk::views::ViewError> {
        Ok(LinotState {
            config: RegisterView::load(context.clone()).await?,
            match_data: RegisterView::load(context.clone()).await?,
            betting_pool: RegisterView::load(context).await?,
        })
    }

    async fn save(&mut self) -> Result<(), linera_sdk::views::ViewError> {
        self.config.save().await?;
        self.match_data.save().await?;
        self.betting_pool.save().await?;
        Ok(())
    }

    fn rollback(&mut self) {
        self.config.rollback();
        self.match_data.rollback();
        self.betting_pool.rollback();
    }

    fn flush(&mut self, batch: &mut Batch) -> Result<(), linera_sdk::views::ViewError> {
        self.config.flush(batch)?;
        self.match_data.flush(batch)?;
        self.betting_pool.flush(batch)?;
        Ok(())
    }

    fn clear(&mut self) {
        self.config.clear();
        self.match_data.clear();
        self.betting_pool.clear();
    }
}
```

---

## 📚 Linera SDK 0.15.4 Reference Patterns

### **Pattern 1: Contract Structure**

```rust
pub struct MyContract {
    state: MyState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(MyContract);

impl Contract for MyContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = Config;
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = MyState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        Self { state, runtime }
    }

    async fn instantiate(&mut self, argument: Self::InstantiationArgument) {
        // Initialize state
        self.state.config.set(argument).await.expect("Failed");
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        // Handle operations
    }

    async fn execute_message(&mut self, message: Self::Message) {
        // Handle cross-chain messages
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}
```

### **Pattern 2: RootView State**

```rust
#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct MyState {
    pub field1: RegisterView<SomeType>,
    pub field2: MapView<KeyType, ValueType>,
}
```

### **Pattern 3: RegisterView Usage**

From Microbet (confirmed working):

```rust
// Reading
let round_id_opt = self.active_round.get();  // Sync, returns reference
let value = *round_id_opt;  // Dereference if needed

// Writing
self.active_round.set(new_value).await?;  // Async
```

From ChainClashArena (different pattern):

```rust
// Reading
let players = self.state.players.get().await.expect("Failed");  // Async!

// Writing
self.state.players.set(new_players).await.expect("Failed");  // Async
```

**Conclusion:**  
The async pattern seems to be version-dependent. For SDK 0.15.4, assume async and use `.await`.

### **Pattern 4: Authentication**

```rust
let caller = self.runtime.authenticated_signer().expect("Caller required");
```

### **Pattern 5: System Time**

```rust
let timestamp = self.runtime.system_time().micros();
```

### **Pattern 6: Chain ID**

```rust
let chain_id = self.runtime.chain_id();
let seed = chain_id.to_string();  // For deterministic operations
```

---

## 🔍 Debugging Strategies

### **Strategy 1: Inspect SDK Source Code**

```bash
# Find Linera SDK installation
ls ~/.cargo/registry/src/index.crates.io-*/linera-*-0.15.4/

# Read RegisterView implementation
cat ~/.cargo/registry/src/index.crates.io-*/linera-views-0.15.4/src/views/register.rs

# Read RootView macro
cat ~/.cargo/registry/src/index.crates.io-*/linera-views-0.15.4/src/views/root.rs
```

### **Strategy 2: Check Reference Projects**

**Microbet** (confirmed working with Linera 0.15.x):

```bash
git clone https://github.com/egorble/Microbet
cd Microbet
grep -n "RegisterView" src/state.rs
grep -n "RootView" src/state.rs
```

**ChainClashArena** (game with similar structure):

```bash
git clone https://github.com/dinitheth/ChainClashArena
cd ChainClashArena/backend/game_contract
cat src/lib.rs  # Check their state structure
```

### **Strategy 3: Compiler Verbose Output**

```bash
cargo build --verbose 2>&1 | tee build.log
# Examine build.log for detailed errors
```

### **Strategy 4: Expand Macros**

```bash
cargo expand --lib > expanded.rs
# See what the RootView macro generates
```

### **Strategy 5: Minimal Reproduction**

Create a minimal test case:

```rust
// test_views.rs
#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct TestState {
    pub value: RegisterView<u64>,
}

#[test]
fn test_view_creation() {
    // Minimal test to isolate the issue
}
```

---

## 🛠️ Development Workflow

### **Step 1: Fix State Layer**

Priority: Get `state.rs` compiling first.

1. Fix RootView derive syntax
2. Verify RegisterView get/set pattern
3. Fix AccountOwner default
4. Run `cargo check` until clean

### **Step 2: Fix Contract Layer**

Once state compiles:

1. Update all `.get()` calls (add/remove `.await` as needed)
2. Update all `.set()` calls similarly
3. Verify `load()` and `save()` work
4. Run `cargo check`

### **Step 3: Implement Service**

After contract compiles:

1. Create GraphQL schema
2. Implement query resolvers
3. Add state filtering (hide opponent cards)
4. Test queries

### **Step 4: Test End-to-End**

1. Build WASM: `cargo build --release --target wasm32-unknown-unknown`
2. Start local Linera network: `linera net up`
3. Deploy contract
4. Execute operations via CLI
5. Query state via GraphQL

---

## 📖 Key Files to Study

### **Must Read:**

1. `~/.cargo/registry/src/.../linera-views-0.15.4/src/views/register.rs`
2. `~/.cargo/registry/src/.../linera-views-0.15.4/src/views/root.rs`
3. Reference project: Microbet's `src/state.rs` and `src/contract.rs`

### **Should Read:**

4. Linera docs: <https://linera.dev/developers/sdk/state>
5. Linera docs: <https://linera.dev/developers/sdk/views>
6. Async-graphql docs: <https://async-graphql.github.io/async-graphql/>

---

## 🎯 Next Developer Tasks

### **Immediate (Critical):**

- [ ] Fix RootView derive macro in `state.rs`
- [ ] Determine correct RegisterView API (sync vs async)
- [ ] Fix AccountOwner default value
- [ ] Get `cargo build` passing

### **Short-term:**

- [ ] Implement `service.rs` with GraphQL queries
- [ ] Add proper error handling (replace `panic!` with `Result`)
- [ ] Write unit tests for `game_engine.rs`
- [ ] Write integration test in `tests/single_chain.rs`

### **Medium-term:**

- [ ] Add logging/tracing for debugging
- [ ] Optimize state storage (consider compression)
- [ ] Add monitoring metrics
- [ ] Document all public APIs

### **Long-term (V2+):**

- [ ] Support 3-6 players
- [ ] Cross-chain invites (Wave 3)
- [ ] Betting/staking (Wave 4-5)
- [ ] Tournament system (Wave 6)

---

## 💡 Pro Tips

### **Tip 1: Use cargo-expand**

```bash
cargo install cargo-expand
cargo expand --lib > expanded.rs
# See exactly what macros generate
```

### **Tip 2: Check SDK Examples**

```bash
# Linera SDK has example contracts
git clone https://github.com/linera-io/linera-protocol
cd linera-protocol/linera-sdk/examples
# Study fungible, crowd-funding, etc.
```

### **Tip 3: Join Linera Discord**

If stuck, ask in the Linera developer Discord:

- <https://discord.gg/linera>

### **Tip 4: Version Lock**

Never upgrade SDK version mid-development:

```toml
# Cargo.toml - Keep exact versions
linera-sdk = "=0.15.4"  # Note the = sign
linera-views = "=0.15.4"
```

### **Tip 5: Clean Rebuilds**

When stuck with weird errors:

```bash
cargo clean
rm -rf target/
cargo build
```

---

## 🆘 Troubleshooting FAQs

### **Q: RootView derive keeps failing**

A: Check these in order:

1. Is `#[view(context = "ViewStorageContext")]` on its own line?
2. Are all fields pub?
3. Do all nested types implement View trait?
4. Try `cargo expand` to see what's happening

### **Q: "Future not awaited" errors everywhere**

A: RegisterView API changed between versions. Check reference projects for your SDK version's pattern.

### **Q: Contract loads but doesn't save state**

A: Ensure `store()` is actually called. In Linera, it's automatic after operations, but verify your changes call `.set()` on Views.

### **Q: "Type does not implement View" errors**

A: All types stored in RegisterView/MapView must implement View trait. Use simple types (primitives, Vec, Option) or derive View on custom types.

### **Q: Tests fail but contract builds**

A: Tests may need mocked runtime. Check Linera SDK test examples for proper test setup.

---

## 📋 Checklist for New Developers

Before starting work:

- [ ] Read this guide completely
- [ ] Read `backend/README.md`
- [ ] Read `docs/building_logic_v1.md`
- [ ] Clone and study Microbet repository
- [ ] Install Rust, wasm32 target, Linera CLI
- [ ] Run `cargo check` and understand current errors

Before committing:

- [ ] Run `cargo fmt`
- [ ] Run `cargo clippy` and fix warnings
- [ ] Run `cargo test`
- [ ] Run `cargo build --release --target wasm32-unknown-unknown`
- [ ] Update documentation if you changed APIs

Before deploying:

- [ ] Test on local Linera network
- [ ] Test all operations via CLI
- [ ] Query state via GraphQL to verify correctness
- [ ] Test edge cases (full deck, empty deck, win conditions)

---

## 🔗 Quick Reference Links

- **Linera Docs**: <https://linera.dev>
- **Linera SDK GitHub**: <https://github.com/linera-io/linera-protocol>
- **Microbet Reference**: <https://github.com/egorble/Microbet>
- **ChainClash Reference**: <https://github.com/dinitheth/ChainClashArena>
- **Async GraphQL**: <https://async-graphql.github.io/async-graphql/>
- **Whot Rules**: `../docs/backend_whot_rules.md`

---

**Good luck building! 🚀**

_Last Updated: 2025-11-07_  
_SDK Version: 0.15.4_  
_Status: Active Development_
