import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import CardComponent from "../components/Card";
import { Toaster } from "react-hot-toast";
import { getPlayableCards } from "../lib/gameLogic";

const Game: React.FC = () => {
  const {
    players,
    currentPlayerIndex,
    deck,
    gameStatus,
    winner,
    lastPlayedCard,
    pendingPenalty,
    whotShapeDemand,
    playCard,
    drawCard,
    resetGame,
    setWhotShapeDemand,
  } = useGameStore();

  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const player = players[0];
  const computer = players[1];
  const isPlayerTurn = currentPlayerIndex === 0;

  const playableCards = getPlayableCards(player.hand, lastPlayedCard, {
    pendingPenalty,
    whotShapeDemand,
  });

  const handleCardClick = (cardId: string) => {
    if (!isPlayerTurn) return;

    const card = player.hand.find((c) => c.id === cardId);
    if (!card) return;

    const isPlayable = playableCards.some((c) => c.id === cardId);
    if (!isPlayable) return;

    if (card.suit === "whot") {
      setSelectedCard(cardId);
      setShowShapeSelector(true);
    } else {
      playCard(cardId, player.id);
    }
  };

  const handleShapeSelection = (shape: string) => {
    if (selectedCard) {
      playCard(selectedCard, player.id);
      setWhotShapeDemand(shape);
      setShowShapeSelector(false);
      setSelectedCard(null);
    }
  };

  const handleDeckClick = () => {
    if (!isPlayerTurn) return;
    drawCard(player.id);
  };

  if (gameStatus === "waiting") {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-void-950 via-void-900 to-void-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 border-4 border-ember-500 border-t-transparent rounded-full animate-spin mb-6 mx-auto" />
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Loading Linot...
          </h1>
          <p className="text-gray-400">Preparing your game</p>
        </motion.div>
      </div>
    );
  }

  if (gameStatus === "finished") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-screen bg-gradient-to-br from-void-950 via-void-900 to-void-800 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="glass rounded-2xl p-8 max-w-md w-full text-center border-2 border-ember-500/30"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-7xl mb-6"
          >
            {winner === "You" ? "🏆" : "🤖"}
          </motion.div>

          <h1 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ember-400 to-ember-600 mb-3">
            Game Over!
          </h1>

          <p className="text-2xl text-white font-semibold mb-8">
            {winner} {winner === "You" ? "won!" : "wins!"}
          </p>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-ember-500 to-ember-600 hover:from-ember-600 hover:to-ember-700 text-white font-bold py-4 px-6 rounded-xl transition-all glow-ember"
            >
              Play Again
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="w-full glass hover:bg-white/10 text-white font-semibold py-4 px-6 rounded-xl transition-all"
            >
              Back to Menu
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="game-root min-h-screen w-screen bg-gradient-to-br from-void-950 via-void-900 to-void-800 flex flex-col overflow-auto md:overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1c1c26",
            color: "#fff",
            border: "1px solid rgba(255, 61, 31, 0.3)",
          },
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass border-b border-white/10 px-4 sm:px-6 py-3 flex justify-between items-center shrink-0 z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-ember-500 to-ember-700 rounded-xl flex items-center justify-center shadow-lg glow-ember">
            <span className="text-white text-xl font-bold">L</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ember-400 to-ember-600">
            Linot
          </h1>
        </div>

        {/* Deck Info & Exit */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="glass px-3 py-1.5 rounded-lg">
            <span className="text-gray-400 text-sm hidden sm:inline">
              Deck:{" "}
            </span>
            <span className="text-white font-bold">{deck.length}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="glass hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm"
          >
            Exit
          </motion.button>
        </div>
      </motion.div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 felt-texture opacity-50" />

        {/* Computer Area */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 px-4 py-3 shrink-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-void-700 to-void-900 rounded-full flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <span className="text-white font-semibold text-sm sm:text-base">
                Computer
              </span>
              <span className="text-gray-400 text-xs sm:text-sm">
                ({computer.hand.length} cards)
              </span>
            </div>

            {!isPlayerTurn && (
              <div className="glass px-3 py-1 rounded-full">
                <span className="text-ember-400 text-xs font-semibold animate-pulse">
                  ● Playing...
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-1 overflow-x-auto pb-2">
            {computer.hand.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                style={{ marginLeft: index > 0 ? "-12px" : "0" }}
              >
                <CardComponent card={card} isFaceUp={false} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Center Play Area */}
        <div className="flex-1 flex items-center justify-center relative px-4 min-h-0">
          <div className="flex items-center gap-6 sm:gap-12">
            {/* Draw Pile (Clickable) */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeckClick}
              className={`
                relative cursor-pointer
                ${
                  isPlayerTurn
                    ? "hover:shadow-2xl"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
            >
                
              {/* Stacked Effect  */}
               <div className="absolute top-1 left-1 w-full h-full bg-gradient-to-br from-ember-600/30 to-ember-800/30 rounded-xl blur-sm" />  
               <div className="absolute top-0.5 left-0.5 w-full h-full bg-gradient-to-br from-ember-600/50 to-ember-800/50 rounded-xl" />

              {/* Main Deck */}
              <div className="relative w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-40 bg-gradient-to-br from-ember-600 via-ember-700 to-ember-900 rounded-xl shadow-2xl flex flex-col items-center justify-center border-2 border-ember-500/50">
                <div className="text-white text-4xl sm:text-5xl mb-2">🃏</div>
                <div className="text-ember-200 font-bold text-lg">
                  {deck.length}
                </div>
              </div>

              <div className="text-center mt-2">
                <p className="text-gray-400 text-xs sm:text-sm font-semibold">
                  {isPlayerTurn ? "Click to Draw" : "Draw Pile"}
                </p>
              </div>
            </motion.div>

            {/* Discard Pile */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {lastPlayedCard && (
                  <motion.div
                    key={lastPlayedCard.id}
                    initial={{ scale: 0, rotate: 180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: -180, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="glow-ember-strong"
                  >
                    <CardComponent card={lastPlayedCard} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center mt-2">
                <p className="text-gray-400 text-xs sm:text-sm font-semibold">
                  Last Played
                </p>
                {whotShapeDemand && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-1 glass px-3 py-1 rounded-full inline-block"
                  >
                    <span className="text-ember-400 text-xs font-bold">
                      Call: {whotShapeDemand.toUpperCase()}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pick Penalty Warning */}
        <AnimatePresence>
          {pendingPenalty > 0 && isPlayerTurn && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-[40%] left-1/2 transform -translate-x-1/2 z-20"
            >
              <div className="glass bg-red-500/20 border-2 border-red-500 px-6 py-3 rounded-xl text-center glow-ember animate-pulse-glow">
                <p className="text-white font-bold text-sm sm:text-base">
                  ⚠️ Pick {pendingPenalty} Active!
                </p>
                <p className="text-red-200 text-xs sm:text-sm mt-1">
                  Play Pick 2 or draw {pendingPenalty} cards
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player Hand Area */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 px-4 py-3 shrink-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-ember-500 to-ember-700 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <span className="text-white font-semibold text-sm sm:text-base">
                Your Hand
              </span>
              <span className="text-gray-400 text-xs sm:text-sm">
                ({player.hand.length} cards)
              </span>
            </div>

            {isPlayerTurn && (
              <div className="glass px-3 py-1 rounded-full">
                <span className="text-emerald-400 text-xs font-semibold animate-pulse">
                  ● Your Turn
                </span>
              </div>
            )}
          </div>

          {/* Player Cards */}
          <div className="flex justify-center overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-end" style={{ minHeight: "180px" }}>
              <AnimatePresence>
                {player.hand.map((card, index) => {
                  const isPlayable = playableCards.some(
                    (c) => c.id === card.id
                  );
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        marginLeft: index > 0 ? "-16px" : "0",
                        zIndex: player.hand.length - index,
                      }}
                    >
                      <CardComponent
                        card={card}
                        isPlayable={isPlayable && isPlayerTurn}
                        onClick={() => handleCardClick(card.id)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Shape Selector Modal */}
      <AnimatePresence>
        {showShapeSelector && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShapeSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="glass rounded-2xl p-6 max-w-md w-full border-2 border-ember-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ember-400 to-ember-600 mb-6 text-center">
                Choose a Shape
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    name: "circle",
                    symbol: "⭕",
                    color: "from-azure to-blue-500",
                  },
                  {
                    name: "triangle",
                    symbol: "🔺",
                    color: "from-jade to-green-500",
                  },
                  {
                    name: "square",
                    symbol: "⬜",
                    color: "from-amber to-yellow-500",
                  },
                  {
                    name: "star",
                    symbol: "⭐",
                    color: "from-amethyst to-purple-500",
                  },
                  {
                    name: "cross",
                    symbol: "✖️",
                    color: "from-rose to-red-500",
                  },
                ].map((shape) => (
                  <motion.button
                    key={shape.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShapeSelection(shape.name)}
                    className={`
                      glass hover:bg-white/10
                      bg-gradient-to-br ${shape.color}
                      bg-clip-padding
                      text-white font-bold py-6 rounded-xl
                      transition-all flex flex-col items-center gap-2
                      border-2 border-white/20 hover:border-white/40
                    `}
                  >
                    <span className="text-4xl">{shape.symbol}</span>
                    <span className="text-sm capitalize">{shape.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
