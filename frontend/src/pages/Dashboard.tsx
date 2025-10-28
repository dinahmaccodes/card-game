import React, { useState } from "react";

interface DashboardProps {
  onStartGame: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartGame }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-void-950 via-void-900 to-void-800 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="text-center sm:pt-12 pb-6 px-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-ember-500 to-ember-700 rounded-xl flex items-center justify-center shadow-2xl glow-ember">
            <span className="text-white text-2xl sm:text-3xl font-bold">L</span>
          </div>
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white mb-2 mt-4">
          Linot!
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Play the timeless Whot card game in 2D
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
              or numbers, use special cards wisely, and be the first to empty
              your hand!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={onStartGame}
              className="w-full bg-gradient-to-r from-ember-500 to-ember-600 hover:from-ember-600 hover:to-ember-700 text-white font-bold py-3.5 sm:py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl glow-ember text-base sm:text-lg"
            >
              Start New Game
            </button>

            <button
              onClick={() => setShowRules(true)}
              className="w-full glass hover:bg-white/10 text-white font-semibold py-3 sm:py-3.5 px-6 rounded-xl transition-all duration-200 border border-glass-border hover:border-white/30 backdrop-blur-sm text-sm sm:text-base"
            >
              How to Play
            </button>
          </div>

          {/* Game Features */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="glass p-4 sm:p-5 rounded-xl border border-glass-border text-center hover:bg-white/10 transition-all duration-200">
              <div className="text-3xl sm:text-4xl mb-2">🎮</div>
              <div className="text-white text-xs sm:text-sm font-semibold mb-1">
                Single Player
              </div>
              <div className="text-gray-400 text-xs">vs Computer</div>
            </div>
            <div className="glass p-4 sm:p-5 rounded-xl border border-glass-border text-center hover:bg-white/10 transition-all duration-200">
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
          Linot! v1.0 • The Classic Card Game
        </p>
      </footer>

      {/* Rules Modal */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowRules(false)}
        >
          <div
            className="bg-void-900/95 backdrop-blur-xl rounded-2xl border border-glass-border max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 md:p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-glass-border">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white pr-4">
                  How to Play Linot!
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
                <div className="glass p-4 sm:p-5 rounded-xl border border-glass-border">
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
                    <li className="flex items-start gap-2.5 glass p-3 sm:p-3.5 rounded-lg border border-glass-border text-sm sm:text-base">
                      <span className="text-ember-500 mt-0.5 shrink-0">•</span>
                      <span>
                        Match cards by{" "}
                        <strong className="text-white">shape</strong> (Circle,
                        Triangle, Cross, Square, Star) or{" "}
                        <strong className="text-white">number</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 glass p-3 sm:p-3.5 rounded-lg border border-glass-border text-sm sm:text-base">
                      <span className="text-ember-500 mt-0.5 shrink-0">•</span>
                      <span>
                        If you can't play, click the deck to draw a card
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 glass p-3 sm:p-3.5 rounded-lg border border-glass-border text-sm sm:text-base">
                      <span className="text-ember-500 mt-0.5 shrink-0">•</span>
                      <span>
                        When you have 1 card left, you'll see "Last Card!"
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 glass p-3 sm:p-3.5 rounded-lg border border-glass-border text-sm sm:text-base">
                      <span className="text-ember-500 mt-0.5 shrink-0">•</span>
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
                    <div className="glass p-3.5 sm:p-4 rounded-lg border border-glass-border hover:bg-white/10 transition-colors">
                      <div className="font-bold text-ember-400 text-sm sm:text-base mb-1">
                        1 - Hold On
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Play another card immediately (any card!)
                      </div>
                    </div>

                    <div className="glass p-3.5 sm:p-4 rounded-lg border border-glass-border hover:bg-white/10 transition-colors">
                      <div className="font-bold text-ember-400 text-sm sm:text-base mb-1">
                        2 - Pick Two
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Next player draws 2 (cannot defend!)
                      </div>
                    </div>

                    <div className="glass p-3.5 sm:p-4 rounded-lg border border-glass-border hover:bg-white/10 transition-colors">
                      <div className="font-bold text-ember-400 text-sm sm:text-base mb-1">
                        5 - Pick Three
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Next player draws 3 (can defend with another 5!)
                      </div>
                    </div>

                    <div className="glass p-3.5 sm:p-4 rounded-lg border border-glass-border hover:bg-white/10 transition-colors">
                      <div className="font-bold text-ember-400 text-sm sm:text-base mb-1">
                        8 - Suspension
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Suspend opponent & play again (normal rules)
                      </div>
                    </div>

                    <div className="glass p-3.5 sm:p-4 rounded-lg border border-glass-border hover:bg-white/10 transition-colors">
                      <div className="font-bold text-ember-400 text-sm sm:text-base mb-1">
                        14 - General Market
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Everyone else draws 1 card
                      </div>
                    </div>

                    <div className="glass p-3.5 sm:p-4 rounded-lg border border-glass-border hover:bg-white/10 transition-colors">
                      <div className="font-bold text-ember-400 text-sm sm:text-base mb-1">
                        20 - Whot (Wild)
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Play on anything - choose next shape
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Rules */}
                <div className="glass p-4 sm:p-5 rounded-xl border border-ember-500/30 bg-ember-500/5">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Important Rules</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-ember-400 mt-0.5 shrink-0">•</span>
                      <span>
                        <strong className="text-white">Hold On (1):</strong> You
                        MUST play a second card of ANY choice
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-400 mt-0.5 shrink-0">•</span>
                      <span>
                        <strong className="text-white">Suspension (8):</strong>{" "}
                        Play again following normal matching rules until you
                        play a non-8 card
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-400 mt-0.5 shrink-0">•</span>
                      <span>
                        <strong className="text-white">Pick 2:</strong> Cannot
                        be defended - must draw 2 cards
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-400 mt-0.5 shrink-0">•</span>
                      <span>
                        <strong className="text-white">Pick 3:</strong> Can
                        defend with another Pick 3 (penalty stays at 3, doesn't
                        stack!)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-400 mt-0.5 shrink-0">•</span>
                      <span>
                        <strong className="text-white">Linot cards:</strong>{" "}
                        Cannot be used to defend against penalty cards (2, 5, or
                        14)
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Pro Tips */}
                <div className="glass p-4 sm:p-5 rounded-xl border border-glass-border">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span>💡</span>
                    <span>Pro Tips</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-jade mt-0.5 shrink-0">✓</span>
                      <span>
                        Save Linot cards for emergencies when you can't match
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-jade mt-0.5 shrink-0">✓</span>
                      <span>
                        Get rid of high-value cards (14, 13, 12) early in the
                        game
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-jade mt-0.5 shrink-0">✓</span>
                      <span>
                        Use Hold On (1) strategically to get rid of bad cards
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-jade mt-0.5 shrink-0">✓</span>
                      <span>Watch what shapes the computer is collecting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-jade mt-0.5 shrink-0">✓</span>
                      <span>
                        Suspension (8) chains can turn the game around!
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 sm:mt-8 pt-4 border-t border-glass-border">
                <button
                  onClick={() => setShowRules(false)}
                  className="w-full bg-gradient-to-r from-ember-500 to-ember-600 hover:from-ember-600 hover:to-ember-700 text-white font-bold py-3 sm:py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
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
