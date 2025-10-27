import React, { useState } from "react";

interface DashboardProps {
  onStartGame: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartGame }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="text-center pt-8 sm:pt-12 pb-6 px-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl sm:text-3xl font-bold">L</span>
          </div>
        </div>
        <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl text-white mb-2">
          Linot
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Lightning-fast card game on Linera
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6">
        <div className="text-center max-w-md w-full">
          {/* Game Description */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Play?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Challenge the computer in this strategic card game. Match shapes
              or numbers, use special cards, and be the first to empty your
              hand!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={onStartGame}
              className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 sm:py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-base sm:text-lg"
            >
              Start New Game
            </button>

            <button
              onClick={() => setShowRules(true)}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 sm:py-3.5 px-6 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 backdrop-blur-sm text-sm sm:text-base"
            >
              How to Play
            </button>
          </div>

          {/* Game Features */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/5 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl mb-2">🎮</div>
              <div className="text-white text-xs sm:text-sm font-semibold mb-1">
                Single Player
              </div>
              <div className="text-gray-400 text-xs">vs Computer</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl mb-2">⚡</div>
              <div className="text-white text-xs sm:text-sm font-semibold mb-1">
                Quick Games
              </div>
              <div className="text-gray-400 text-xs">5-10 minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 px-4">
        <p className="text-gray-500 text-xs sm:text-sm">
          Linot v1.0 • Built on Linera Blockchain
        </p>
      </footer>

      {/* Rules Modal */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowRules(false)}
        >
          <div
            className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 md:p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/20">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white pr-4">
                  How to Play Linot
                </h2>
                <button
                  onClick={() => setShowRules(false)}
                  className="text-gray-400 hover:text-white text-3xl sm:text-4xl leading-none shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6 text-gray-300">
                {/* Objective */}
                <div className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/20">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>🎯</span>
                    <span>Objective</span>
                  </h3>
                  <p className="text-sm sm:text-base">
                    Be the first player to get rid of all your cards!
                  </p>
                </div>

                {/* Basic Rules */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span>📖</span>
                    <span>Basic Rules</span>
                  </h3>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 bg-white/5 p-3 sm:p-3.5 rounded-lg border border-white/10 text-sm sm:text-base">
                      <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                      <span>
                        Match cards by{" "}
                        <strong className="text-white">shape</strong> (Circle,
                        Triangle, Cross, Square, Star) or{" "}
                        <strong className="text-white">number</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-white/5 p-3 sm:p-3.5 rounded-lg border border-white/10 text-sm sm:text-base">
                      <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                      <span>
                        If you can't play, click the deck to draw a card
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-white/5 p-3 sm:p-3.5 rounded-lg border border-white/10 text-sm sm:text-base">
                      <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                      <span>
                        When you have 1 card left, you'll see "Last Card!"
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-white/5 p-3 sm:p-3.5 rounded-lg border border-white/10 text-sm sm:text-base">
                      <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                      <span>First player to empty their hand wins</span>
                    </li>
                  </ul>
                </div>

                {/* Special Cards */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span>⭐</span>
                    <span>Special Cards</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3.5 sm:p-4 rounded-lg border border-white/20">
                      <div className="font-bold text-orange-400 text-sm sm:text-base mb-1">
                        1 - Hold On
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Skip next player's turn
                      </div>
                    </div>

                    <div className="bg-white/5 p-3.5 sm:p-4 rounded-lg border border-white/20">
                      <div className="font-bold text-orange-400 text-sm sm:text-base mb-1">
                        2 - Pick Two
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Next player draws 2 cards (stackable!)
                      </div>
                    </div>

                    <div className="bg-white/5 p-3.5 sm:p-4 rounded-lg border border-white/20">
                      <div className="font-bold text-orange-400 text-sm sm:text-base mb-1">
                        5 - Pick Three
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Next player draws 3 cards
                      </div>
                    </div>

                    <div className="bg-white/5 p-3.5 sm:p-4 rounded-lg border border-white/20">
                      <div className="font-bold text-orange-400 text-sm sm:text-base mb-1">
                        8 - Suspension
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Skip next player's turn
                      </div>
                    </div>

                    <div className="bg-white/5 p-3.5 sm:p-4 rounded-lg border border-white/20">
                      <div className="font-bold text-orange-400 text-sm sm:text-base mb-1">
                        14 - General Market
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Everyone draws 1 card
                      </div>
                    </div>

                    <div className="bg-white/5 p-3.5 sm:p-4 rounded-lg border border-white/20">
                      <div className="font-bold text-orange-400 text-sm sm:text-base mb-1">
                        20 - Whot (Wild)
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Can be played on anything - choose next shape
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/20">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span>💡</span>
                    <span>Pro Tips</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      <span>Save Whot cards for emergencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      <span>
                        Get rid of high-value cards (14, 13, 12) early
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      <span>Pick 2 can be stacked - use it to defend!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      <span>Watch what shapes the computer is collecting</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 sm:mt-8 pt-4 border-t border-white/20">
                <button
                  onClick={() => setShowRules(false)}
                  className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 sm:py-3.5 px-6 rounded-xl transition-all duration-200 text-sm sm:text-base"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
