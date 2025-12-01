import { create } from "zustand";
import { lineraClient } from "../lib/lineraClient";
import type { GameState } from "../lib/lineraClient";
import toast from "react-hot-toast";

interface BlockchainGameStore {
  // State from blockchain
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;

  // Player info
  playerNickname: string | null;
  hasJoined: boolean;

  // Actions
  fetchGameState: () => Promise<void>;
  joinMatch: (nickname: string) => Promise<void>;
  startMatch: () => Promise<void>;
  playCard: (cardIndex: number, chosenSuit?: string) => Promise<void>;
  drawCard: () => Promise<void>;
  callLastCard: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollingInterval: number | null = null;

export const useBlockchainGameStore = create<BlockchainGameStore>(
  (set, get) => ({
    // Initial state
    gameState: null,
    isLoading: false,
    error: null,
    playerNickname: null,
    hasJoined: false,

    // Fetch current game state from blockchain
    fetchGameState: async () => {
      try {
        set({ isLoading: true, error: null });
        const state = await lineraClient.getMatchState();
        set({ gameState: state, isLoading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch game state";
        set({ error: errorMessage, isLoading: false });
        console.error("Failed to fetch game state:", error);
      }
    },

    // Join the match
    joinMatch: async (nickname: string) => {
      try {
        set({ isLoading: true, error: null });

        await lineraClient.joinMatch(nickname);

        // Wait a bit for blockchain to process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Fetch updated state
        await get().fetchGameState();

        set({
          playerNickname: nickname,
          hasJoined: true,
          isLoading: false,
        });

        toast.success(`Joined as ${nickname}!`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to join match";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    },

    // Start the match (host only)
    startMatch: async () => {
      try {
        set({ isLoading: true, error: null });

        await lineraClient.startMatch();

        // Wait for blockchain to process
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Fetch updated state
        await get().fetchGameState();

        set({ isLoading: false });
        toast.success("Match started!");

        // Start polling for updates
        get().startPolling();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to start match";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    },

    // Play a card
    playCard: async (cardIndex: number, chosenSuit?: string) => {
      try {
        set({ isLoading: true, error: null });

        await lineraClient.playCard(cardIndex, chosenSuit);

        // Wait for blockchain to process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Fetch updated state
        await get().fetchGameState();

        set({ isLoading: false });
        toast.success("Card played!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to play card";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    },

    // Draw a card
    drawCard: async () => {
      try {
        set({ isLoading: true, error: null });

        await lineraClient.drawCard();

        // Wait for blockchain to process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Fetch updated state
        await get().fetchGameState();

        set({ isLoading: false });
        toast.success("Card drawn!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to draw card";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    },

    // Call "Last Card"
    callLastCard: async () => {
      try {
        set({ isLoading: true, error: null });

        await lineraClient.callLastCard();

        // Wait for blockchain to process
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch updated state
        await get().fetchGameState();

        set({ isLoading: false });
        toast.success("🎴 Last Card called!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to call last card";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    },

    // Start polling for game state updates
    startPolling: () => {
      if (pollingInterval) return;

      // Poll every 2 seconds
      pollingInterval = setInterval(() => {
        get().fetchGameState();
      }, 2000);

      console.log("✅ Started polling for game state updates");
    },

    // Stop polling
    stopPolling: () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log("🛑 Stopped polling for game state updates");
      }
    },
  })
);
