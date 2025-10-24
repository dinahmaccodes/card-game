import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardProps {
  onStartGame: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartGame }) => {
  const [showRules, setShowRules] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-screen w-screen bg-linear-to-br from-dark-950 via-dark-900 to-dark-800 flex flex-col"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="text-center py-8 shrink-0"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 bg-linera-500 rounded-full flex items-center justify-center mr-6">
            <span className="text-white text-3xl font-bold">L</span>
          </div>
          <h1 className="font-display text-6xl font-bold text-white">Linot</h1>
        </div>
        <p className="font-body text-2xl text-gray-300">
          African-inspired 2D Whot Card Game
        </p>
      </motion.header>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center max-w-2xl">
          {/* Game Description */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="font-display text-4xl font-bold text-linera-400 mb-6">
              Ready to Play?
            </h2>
            <p className="font-body text-xl text-gray-300 mb-8 leading-relaxed">
              Challenge the computer in this exciting card game. Use strategy
              and luck to be the first to empty your hand!
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartGame}
              className="w-full max-w-md bg-linera-500 hover:bg-linera-600 text-white font-body font-semibold py-6 px-8 rounded-xl transition-colors duration-200 shadow-2xl text-xl"
            >
              Start New Game
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRules(true)}
              className="w-full max-w-md bg-dark-800 hover:bg-dark-700 text-white font-body font-semibold py-4 px-8 rounded-xl transition-colors duration-200 border border-dark-600 text-lg"
            >
              How to Play
            </motion.button>
          </motion.div>

          {/* Game Features */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-2 gap-8 max-w-lg mx-auto"
          >
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 text-center">
              <div className="text-accent-blue text-4xl mb-3">🎮</div>
              <div className="font-body text-white text-lg font-semibold">
                Single Player
              </div>
              <div className="font-body text-gray-400 text-sm">
                vs Computer AI
              </div>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 text-center">
              <div className="text-accent-green text-4xl mb-3">⚡</div>
              <div className="font-body text-white text-lg font-semibold">
                Quick Games
              </div>
              <div className="font-body text-gray-400 text-sm">
                5-10 minutes
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        variants={itemVariants}
        className="text-center py-6 shrink-0"
      >
        <p className="font-body text-gray-500">
          Linot Card Game v1.0 • Built with React + TypeScript + Tailwind CSS
        </p>
      </motion.footer>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRules(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-dark-800 rounded-xl border border-dark-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-3xl font-bold text-linera-400">
                    How to Play Linot
                  </h2>
                  <button
                    onClick={() => setShowRules(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6 text-gray-300 font-body">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Objective
                    </h3>
                    <p>Be the first player to get rid of all your cards!</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Basic Rules
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        Match cards by shape (Circle, Triangle, Cross, Square,
                        Star) or number
                      </li>
                      <li>If you can't play, draw a card from the deck</li>
                      <li>Say "Last Card!" when you have only 1 card left</li>
                      <li>First player to empty their hand wins</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Special Cards
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-dark-700 p-4 rounded-lg">
                        <div className="font-semibold text-linera-300">
                          Card 1 - Hold On
                        </div>
                        <div className="text-sm">Skip next player's turn</div>
                      </div>
                      <div className="bg-dark-700 p-4 rounded-lg">
                        <div className="font-semibold text-linera-300">
                          Card 2 - Pick Two
                        </div>
                        <div className="text-sm">Next player draws 2 cards</div>
                      </div>
                      <div className="bg-dark-700 p-4 rounded-lg">
                        <div className="font-semibold text-linera-300">
                          Card 5 - Pick Three
                        </div>
                        <div className="text-sm">Next player draws 3 cards</div>
                      </div>
                      <div className="bg-dark-700 p-4 rounded-lg">
                        <div className="font-semibold text-linera-300">
                          Card 8 - Suspension
                        </div>
                        <div className="text-sm">Skip next player's turn</div>
                      </div>
                      <div className="bg-dark-700 p-4 rounded-lg">
                        <div className="font-semibold text-linera-300">
                          Card 14 - General Market
                        </div>
                        <div className="text-sm">All players draw 1 card</div>
                      </div>
                      <div className="bg-dark-700 p-4 rounded-lg">
                        <div className="font-semibold text-linera-300">
                          Card 20 - Whot
                        </div>
                        <div className="text-sm">
                          Wild card - choose any shape
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
