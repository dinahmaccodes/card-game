import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dashboard from "./pages/Dashboard";
import Game from "./pages/Game";
import { useGameStore } from "./store/gameStore";

function App() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "game">(
    "dashboard"
  );
  const { startNewGame } = useGameStore();

  const handleStartGame = async () => {
    await startNewGame();
    setCurrentPage("game");
  };

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {currentPage === "dashboard" ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard onStartGame={handleStartGame} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Game />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
