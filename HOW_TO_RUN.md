# How to Run Linot Card Game

## 🚀 One-Command Start

```bash
sudo docker compose up
```

Wait 30-40 seconds for the "READY!" message, then open:

**http://localhost:5173**

---

## 🎮 Playing & Verifying Blockchain

### 1. Open Browser Console

Press **F12** (or right-click → Inspect → Console tab)

### 2. Start a Game

Click **"Start New Game"**

### 3. Watch the Console

You should see:

```
🔗 Syncing player join to blockchain...
✅ Player joined on blockchain
🔗 Starting match on blockchain...
✅ Match started on blockchain
```

### 4. Play Cards

- **Your moves**: Show `🔗 Syncing...` → `✅ synced to blockchain`
- **Computer moves**: Show `🤖 Computer played...` (local, instant)

---

## ✅ Blockchain Integration Proof

**Look for**:

- ✅ Green banner: "Blockchain Integration Active ⛓️"
- ✅ Console logs: `🔗 Syncing...` before actions
- ✅ Console logs: `✅ ...synced to blockchain` after actions
- ✅ GraphQL endpoint working at http://localhost:8081

---

## 📊 What's Running

| Service    | Port | What It Does           |
| ---------- | ---- | ---------------------- |
| Frontend   | 5173 | React game UI          |
| Blockchain | 8080 | Linera chain queries   |
| GraphQL    | 8081 | Game state & mutations |

---

## 🔧 Troubleshooting

### Port conflict error?

```bash
sudo lsof -ti:8080,8081,5173 | xargs kill -9
sudo docker compose down
sudo docker compose up
```

### Frontend not loading?

```bash
# Check logs
sudo docker compose logs frontend

# Rebuild
sudo docker compose up --build
```

### No blockchain logs?

1. Open Developer Console (F12)
2. Go to Console tab
3. Refresh page
4. Start new game

---

## 📚 Full Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[BLOCKCHAIN_INTEGRATION.md](./BLOCKCHAIN_INTEGRATION.md)** - Integration details
- **[README.md](./README.md)** - Project overview

---

## 🎯 Quick Demo (30 seconds)

```bash
# 1. Start
sudo docker compose up

# 2. Wait for "READY!"

# 3. Open http://localhost:5173

# 4. Press F12 for console

# 5. Click "Start New Game"

# 6. Play cards and watch sync logs
```

**That's it!** 🎉

---

**Built with Linera SDK v0.15.5**
