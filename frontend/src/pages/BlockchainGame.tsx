import { useEffect } from "react";
import { motion } from "framer-motion";
import { useBlockchainGameStore } from "../store/blockchainGameStore";
import toast from "react-hot-toast";

export default function BlockchainGame() {
  const {
    gameState,
    isLoading,
    error,
    playerNickname,
    hasJoined,
    fetchGameState,
    joinMatch,
    startMatch,
    drawCard,
    callLastCard,
    startPolling,
    stopPolling,
  } = useBlockchainGameStore();

  // Fetch initial state and start polling
  useEffect(() => {
    fetchGameState();
    startPolling();

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle join match
  const handleJoin = async () => {
    const nickname = prompt("Enter your nickname:");
    if (nickname && nickname.trim()) {
      await joinMatch(nickname.trim());
    }
  };

  // Handle start match
  const handleStart = async () => {
    await startMatch();
  };

  // Handle draw card
  const handleDrawCard = async () => {
    await drawCard();
  };

  // Handle call last card
  const handleCallLastCard = async () => {
    await callLastCard();
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Loading state
  if (isLoading && !gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="text-white text-2xl">Loading game state...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            Linot on Blockchain
          </h1>
          <p className="text-green-200">
            Real-time Whot game powered by Linera microchains
          </p>
        </motion.div>

        {/* Game Status */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            <div>
              <div className="text-green-200 text-sm">Status</div>
              <div className="text-xl font-bold">
                {gameState?.status || "Loading..."}
              </div>
            </div>
            <div>
              <div className="text-green-200 text-sm">Deck Size</div>
              <div className="text-xl font-bold">
                {gameState?.deckSize ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-green-200 text-sm">Top Card</div>
              <div className="text-xl font-bold">
                {gameState?.topCard
                  ? `${gameState.topCard.rank} ${gameState.topCard.suit}`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-green-200 text-sm">Current Player</div>
              <div className="text-xl font-bold">
                {gameState?.currentPlayerIndex ?? "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Player Info */}
        {playerNickname && (
          <div className="bg-blue-500/20 backdrop-blur-lg rounded-lg p-4 mb-6">
            <p className="text-white">
              Playing as: <strong>{playerNickname}</strong>
              {hasJoined && " ✅"}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {!hasJoined && (
              <button
                onClick={handleJoin}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Join Match
              </button>
            )}

            {hasJoined && gameState?.status === "WAITING" && (
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Start Match
              </button>
            )}

            {gameState?.status === "PLAYING" && (
              <>
                <button
                  onClick={handleDrawCard}
                  disabled={isLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Draw Card
                </button>

                <button
                  onClick={handleCallLastCard}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Call Last Card
                </button>
              </>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-black/30 backdrop-blur-lg rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Debug: Game State
          </h3>
          <pre className="text-green-300 text-xs overflow-auto">
            {JSON.stringify(gameState, null, 2)}
          </pre>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-3">How to Play</h3>
          <ol className="text-green-200 space-y-2">
            <li>1. Click "Join Match" and enter your nickname</li>
            <li>2. Click "Start Match" when ready</li>
            <li>3. Play cards or draw from the deck</li>
            <li>4. Call "Last Card" when you have one card left</li>
            <li>5. Game state updates automatically via blockchain polling</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
