import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import CardComponent from "../components/Card";
import { Toaster } from "react-hot-toast";
import { canPlayCard } from "../lib/gameLogic";

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
    canEndTurn,
    playCard,
    drawCard,
    resetGame,
    endTurn,
    setWhotShapeDemand,
  } = useGameStore();

  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const player = players[0]; // Human player
  const computer = players[1]; // Computer player
  const isPlayerTurn = currentPlayerIndex === 0;

  const playableCards = player.hand.filter((card) => {
    if (!lastPlayedCard) return true;
    return canPlayCard(card, lastPlayedCard, whotShapeDemand);
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  const handleCardClick = (cardId: string) => {
    const card = player.hand.find((c) => c.id === cardId);
    if (!card) return;

    if (card.suit === "whot") {
      setSelectedCard(cardId);
      setShowShapeSelector(true);
    } else {
      playCard(cardId, player.id);
    }
  };

  const handleShapeSelection = (shape: string) => {
    if (selectedCard) {
      // Set the demanded shape before playing the card
      setWhotShapeDemand(shape);
      playCard(selectedCard, player.id);
      setShowShapeSelector(false);
      setSelectedCard(null);
    }
  };

  const handleDrawCard = () => {
    if (pendingPenalty > 0) {
      // Draw penalty cards
      for (let i = 0; i < pendingPenalty; i++) {
        drawCard(player.id);
      }
    } else {
      drawCard(player.id);
    }
  };

  if (gameStatus === "waiting") {
    return (
      <div className="h-screen w-screen bg-linear-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Starting Game...
          </h1>
          <p className="font-body text-gray-300">
            Please wait while we set up your game.
          </p>
        </div>
      </div>
    );
  }

  if (gameStatus === "finished") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-screen bg-linear-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center"
      >
        <div className="text-center bg-dark-800 p-8 rounded-xl border border-dark-700 max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-display text-3xl font-bold text-linera-400 mb-4">
            Game Over!
          </h1>
          <p className="font-body text-xl text-white mb-6">{winner} wins!</p>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="w-full bg-linera-500 hover:bg-linera-600 text-white font-body font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Play Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="w-full bg-dark-700 hover:bg-dark-600 text-white font-body font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Menu
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-screen w-screen bg-linear-to-br from-dark-950 via-dark-900 to-dark-800 flex flex-col"
    >
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center p-4 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-linera-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">L</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Linot</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-white font-body">
            <span className="text-gray-400">Cards left: </span>
            <span className="font-semibold">{deck.length}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="bg-dark-700 hover:bg-dark-600 text-white font-body font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Exit Game
          </motion.button>
        </div>
      </div>

      {/* Computer Hand */}
      <div className="px-4 py-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-lg font-bold text-white">
            Computer ({computer.hand.length} cards)
          </h2>
          <div
            className={`px-3 py-1 rounded-full text-sm font-body font-semibold ${
              !isPlayerTurn
                ? "bg-linera-500 text-white animate-pulse"
                : "bg-dark-700 text-gray-400"
            }`}
          >
            {!isPlayerTurn ? "Computer's Turn" : "Waiting..."}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 justify-center">
          {computer.hand.map((card) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <CardComponent card={card} isFaceUp={false} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center space-x-8">
          {/* Deck */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-center"
          >
            <div className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 lg:w-32 lg:h-44 bg-linear-to-br from-dark-800 to-dark-900 border-2 border-linera-500 rounded-xl shadow-lg flex items-center justify-center mb-2">
              <div className="text-linera-500 text-sm font-bold">
                {deck.length}
              </div>
            </div>
            <p className="font-body text-gray-400 text-sm">Deck</p>
          </motion.div>

          {/* Discard Pile */}
          <div className="text-center">
            <AnimatePresence mode="wait">
              {lastPlayedCard && (
                <motion.div
                  key={lastPlayedCard.id}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -180 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardComponent card={lastPlayedCard} />
                </motion.div>
              )}
            </AnimatePresence>
            <p className="font-body text-gray-400 text-sm mt-2">Discard Pile</p>
            {whotShapeDemand && (
              <div className="mt-2 px-3 py-1 bg-linera-500 text-white text-xs rounded-full">
                Demand: {whotShapeDemand}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Penalty Banner */}
      {pendingPenalty > 0 && isPlayerTurn && (
        <div className="bg-linera-500 text-white text-center py-2 px-4 mx-4 rounded-lg mb-2">
          <p className="font-body font-semibold">
            Pick {pendingPenalty} Active! Draw {pendingPenalty} card
            {pendingPenalty > 1 ? "s" : ""} or play a Pick {pendingPenalty}{" "}
            card.
          </p>
        </div>
      )}

      {/* Player Hand */}
      <div className="px-4 py-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-lg font-bold text-white">
            Your Hand ({player.hand.length} cards)
          </h2>
          <div
            className={`px-3 py-1 rounded-full text-sm font-body font-semibold ${
              isPlayerTurn
                ? "bg-linera-500 text-white animate-pulse"
                : "bg-dark-700 text-gray-400"
            }`}
          >
            {isPlayerTurn ? "Your Turn" : "Waiting..."}
          </div>
        </div>

        {/* Responsive Card Layout with Overlapping */}
        <div className="flex justify-center mb-4 overflow-x-auto pb-2">
          <div className="flex items-end" style={{ maxWidth: "90vw" }}>
            <AnimatePresence>
              {player.hand.map((card, index) => {
                const isPlayable = playableCards.some((c) => c.id === card.id);
                return (
                  <motion.div
                    key={card.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0 }}
                    layout
                    className="relative"
                    style={{
                      marginLeft: index > 0 ? "-20px" : "0",
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

        {/* Action Buttons */}
        {isPlayerTurn && (
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDrawCard}
              className="bg-accent-blue hover:bg-blue-600 text-white font-body font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {pendingPenalty > 0
                ? `Draw ${pendingPenalty} Card${pendingPenalty > 1 ? "s" : ""}`
                : "Draw Card"}
            </motion.button>

            {canEndTurn && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => endTurn()}
                className="bg-dark-700 hover:bg-dark-600 text-white font-body font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                End Turn
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Shape Selector Modal */}
      <AnimatePresence>
        {showShapeSelector && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShapeSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-dark-800 rounded-xl border border-dark-700 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-xl font-bold text-linera-400 mb-4 text-center">
                Choose Shape
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {["circle", "triangle", "square", "star", "cross"].map(
                  (shape) => (
                    <motion.button
                      key={shape}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShapeSelection(shape)}
                      className="bg-dark-700 hover:bg-dark-600 text-white font-body font-semibold py-3 px-4 rounded-lg transition-colors capitalize"
                    >
                      {shape}
                    </motion.button>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Game;
