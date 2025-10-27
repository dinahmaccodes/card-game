import { create } from "zustand";
import type { GameState, Player} from "../types/game";
import {
  createDeck,
  dealCards,
  validateCardPlay,
  isGameOver,
  getNextPlayerIndex,
  skipNextPlayer,
  applySpecialCardEffect,
  applyGeneralMarket,
  applyPickPenalty,
  getComputerMove,
  drawCards,
  reshuffleDiscardPile,
} from "../lib/gameLogic";
import toast from "react-hot-toast";

interface GameStore extends GameState {
  // Actions
  startNewGame: () => void;
  playCard: (cardId: string, playerId: string) => void;
  drawCard: (playerId: string) => void;
  resetGame: () => void;
  computerPlay: () => void;
  endTurn: () => void;
  setWhotShapeDemand: (shape: string) => void;
}

const initialPlayers: Player[] = [
  { id: "player", name: "You", hand: [], isComputer: false },
  { id: "computer", name: "Computer", hand: [], isComputer: true },
];

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  players: initialPlayers,
  currentPlayerIndex: 0,
  deck: [],
  discardPile: [],
  gameStatus: "waiting",
  winner: undefined,
  lastPlayedCard: undefined,
  turnDirection: "clockwise",
  cardsToDraw: 0,
  pendingPenalty: 0,
  whotShapeDemand: undefined,
  canEndTurn: false, // Changed to false - player must play or draw first

  // Actions
  startNewGame: () => {
    const deck = createDeck();
    const players = initialPlayers.map((player) => ({ ...player, hand: [] }));
    const remainingDeck = dealCards(deck, players, 5);

    // Start with one card in discard pile
    const [firstCard, ...newDeck] = remainingDeck;

    set({
      players,
      deck: newDeck,
      discardPile: [firstCard],
      lastPlayedCard: firstCard,
      gameStatus: "playing",
      currentPlayerIndex: 0,
      winner: undefined,
      cardsToDraw: 0,
      pendingPenalty: 0,
      whotShapeDemand: undefined,
      canEndTurn: false,
      turnDirection: "clockwise",
    });

    toast.success("New game started! You go first.");
  },

  playCard: (cardId: string, playerId: string) => {
    const state = get();
    const player = state.players.find((p) => p.id === playerId);

    if (!player || state.gameStatus !== "playing") {
      toast.error("Cannot play card at this time");
      return;
    }

    const playerIndex = state.players.findIndex((p) => p.id === playerId);
    if (state.currentPlayerIndex !== playerIndex) {
      toast.error("Not your turn!");
      return;
    }

    const cardIndex = player.hand.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) {
      toast.error("Card not found in hand");
      return;
    }

    const card = player.hand[cardIndex];

    // VALIDATE CARD PLAY with detailed error messages
    const validation = validateCardPlay(card, state);
    if (!validation.valid) {
      toast.error(validation.reason || "Invalid card play!");
      return;
    }

    // Remove card from player's hand
    const newHand = player.hand.filter((c) => c.id !== cardId);
    const updatedPlayers = state.players.map((p) =>
      p.id === playerId ? { ...p, hand: newHand } : p
    );

    // Add card to discard pile
    const newDiscardPile = [...state.discardPile, card];

    // Check for "Last Card" notification
    if (newHand.length === 1) {
      toast.success("🎴 Last Card!", {
        duration: 2000,
        style: {
          background: "#DE2A02",
          color: "#fff",
        },
      });
    }

    // Check for game over
    const winner = isGameOver(updatedPlayers);
    if (winner) {
      set({
        players: updatedPlayers,
        discardPile: newDiscardPile,
        lastPlayedCard: card,
        gameStatus: "finished",
        winner: winner.name,
      });
      toast.success(`🏆 ${winner.name} wins!`, {
        duration: 5000,
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });
      return;
    }

    // Handle GENERAL MARKET (14) - special case, affects all players
    if (card.number === 14) {
      const stateWithCard = {
        ...state,
        players: updatedPlayers,
        discardPile: newDiscardPile,
        lastPlayedCard: card,
        whotShapeDemand: undefined,
        pendingPenalty: 0,
      };

      const newState = applyGeneralMarket(stateWithCard);

      toast("🛒 General Market! Everyone draws 1 card.", {
        duration: 3000,
        icon: "🛒",
        style: {
          background: "#FBBF24",
          color: "#000",
        },
      });

      // Move to next player
      const nextPlayerIndex = getNextPlayerIndex(
        state.currentPlayerIndex,
        state.players.length,
        state.turnDirection
      );

      set({
        ...newState,
        currentPlayerIndex: nextPlayerIndex,
        canEndTurn: false,
      });

      // If it's computer's turn, play automatically
      if (newState.players[nextPlayerIndex].isComputer) {
        setTimeout(() => {
          get().computerPlay();
        }, 1500);
      }
      return;
    }

    // Handle WHOT card (wild card)
    if (card.suit === "whot") {
      set({
        players: updatedPlayers,
        discardPile: newDiscardPile,
        lastPlayedCard: card,
        pendingPenalty: 0,
        // Don't change turn yet - player needs to choose shape
      });

      toast.success("🌟 Whot card played! Choose a shape.", {
        duration: 3000,
      });

      // Player needs to call setWhotShapeDemand() before turn advances
      // This should trigger a shape selector modal in the UI
      return;
    }

    // Apply special card effects (Pick 2, Pick 3, Hold On, Suspension)
    const specialEffects = applySpecialCardEffect(card, state);

    // Determine next player index
    let nextPlayerIndex: number;
    
    // HOLD ON (1) or SUSPENSION (8) - skip next player
    if (card.number === 1 || card.number === 8) {
      nextPlayerIndex = skipNextPlayer(
        state.currentPlayerIndex,
        state.players.length,
        state.turnDirection
      );
      
      const skippedPlayer = state.players[
        getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.turnDirection)
      ];
      
      toast(`⏸️ ${skippedPlayer.name}'s turn skipped!`, {
        duration: 2000,
        icon: "⏸️",
      });
    } else {
      nextPlayerIndex = getNextPlayerIndex(
        state.currentPlayerIndex,
        state.players.length,
        state.turnDirection
      );
    }

    // Show Pick penalty notification if active
    if (specialEffects.pendingPenalty && specialEffects.pendingPenalty > 0) {
      toast(`⚠️ Pick ${specialEffects.pendingPenalty} is now active!`, {
        duration: 4000,
        icon: "⚠️",
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });
    }

    set({
      players: updatedPlayers,
      discardPile: newDiscardPile,
      lastPlayedCard: card,
      currentPlayerIndex: nextPlayerIndex,
      whotShapeDemand: undefined, // Clear any previous Whot demand
      ...specialEffects,
      canEndTurn: false,
    });

    // If it's computer's turn, play automatically after a delay
    if (updatedPlayers[nextPlayerIndex].isComputer) {
      setTimeout(() => {
        get().computerPlay();
      }, 1500);
    }
  },

  drawCard: (playerId: string) => {
    const state = get();
    const player = state.players.find((p) => p.id === playerId);

    if (!player || state.gameStatus !== "playing") {
      toast.error("Cannot draw card at this time");
      return;
    }

    const playerIndex = state.players.findIndex((p) => p.id === playerId);
    if (state.currentPlayerIndex !== playerIndex) {
      toast.error("Not your turn!");
      return;
    }

    // Check if deck needs reshuffling
    let currentDeck = state.deck;
    let currentDiscardPile = state.discardPile;

    if (currentDeck.length === 0) {
      const { newDeck, newDiscardPile } = reshuffleDiscardPile(
        currentDeck,
        currentDiscardPile
      );
      currentDeck = newDeck;
      currentDiscardPile = newDiscardPile;
      
      if (currentDeck.length > 0) {
        toast("♻️ Deck reshuffled!", { duration: 2000 });
      }
    }

    if (currentDeck.length === 0) {
      toast.error("No cards left in deck!");
      return;
    }

    // Handle PICK PENALTY (Pick 2 or Pick 3)
    if (state.pendingPenalty > 0) {
      const { updatedPlayer, remainingDeck } = applyPickPenalty(
        player,
        currentDeck,
        state.pendingPenalty
      );

      const updatedPlayers = state.players.map((p) =>
        p.id === playerId ? updatedPlayer : p
      );

      toast.error(`Drew ${state.pendingPenalty} cards! 😓`, {
        duration: 3000,
      });

      // Move to next player after drawing penalty
      const nextPlayerIndex = getNextPlayerIndex(
        state.currentPlayerIndex,
        state.players.length,
        state.turnDirection
      );

      set({
        players: updatedPlayers,
        deck: remainingDeck,
        discardPile: currentDiscardPile,
        currentPlayerIndex: nextPlayerIndex,
        pendingPenalty: 0, // Reset penalty after drawing
        canEndTurn: false,
      });

      // If it's computer's turn, play automatically
      if (updatedPlayers[nextPlayerIndex].isComputer) {
        setTimeout(() => {
          get().computerPlay();
        }, 1500);
      }
      return;
    }

    // NORMAL DRAW: Draw 1 card
    const { drawnCards, remainingDeck } = drawCards(currentDeck, 1);

    if (drawnCards.length === 0) {
      toast.error("Failed to draw card!");
      return;
    }

    const updatedPlayers = state.players.map((p) =>
      p.id === playerId ? { ...p, hand: [...p.hand, ...drawnCards] } : p
    );

    // Move to next player after drawing
    const nextPlayerIndex = getNextPlayerIndex(
      state.currentPlayerIndex,
      state.players.length,
      state.turnDirection
    );

    set({
      players: updatedPlayers,
      deck: remainingDeck,
      discardPile: currentDiscardPile,
      currentPlayerIndex: nextPlayerIndex,
      canEndTurn: false,
    });

    // If it's computer's turn, play automatically
    if (updatedPlayers[nextPlayerIndex].isComputer) {
      setTimeout(() => {
        get().computerPlay();
      }, 1500);
    }
  },

  computerPlay: () => {
    const state = get();
    const computer = state.players[state.currentPlayerIndex];

    if (!computer.isComputer || state.gameStatus !== "playing") {
      return;
    }

    // Get computer's move (now smarter with the fixed logic)
    const move = getComputerMove(computer.hand, state);

    if (move.action === "play" && move.cardId) {
      const card = computer.hand.find((c) => c.id === move.cardId);
      
      // Play the card
      get().playCard(move.cardId, computer.id);

      // If Whot was played, automatically set the chosen shape
      if (card?.suit === "whot" && move.chosenShape) {
        setTimeout(() => {
          get().setWhotShapeDemand(move.chosenShape!);
          
          // Format shape name nicely
          const shapeName = move.chosenShape!.charAt(0).toUpperCase() + 
                           move.chosenShape!.slice(1);
          
          toast.success(`Computer demands: ${shapeName}!`, {
            duration: 3000,
            icon: "🤖",
          });

          // Move to next player after setting shape
          const nextPlayerIndex = getNextPlayerIndex(
            state.currentPlayerIndex,
            state.players.length,
            state.turnDirection
          );

          set({
            currentPlayerIndex: nextPlayerIndex,
            canEndTurn: false,
          });
        }, 800);
      }
    } else {
      // Computer draws a card
      get().drawCard(computer.id);
    }
  },

  endTurn: () => {
    const state = get();
    
    // Player must have played or drawn before ending turn
    if (!state.canEndTurn || state.gameStatus !== "playing") {
      toast.error("You must play a card or draw before ending turn!");
      return;
    }

    const nextPlayerIndex = getNextPlayerIndex(
      state.currentPlayerIndex,
      state.players.length,
      state.turnDirection
    );

    set({
      currentPlayerIndex: nextPlayerIndex,
      canEndTurn: false, // Reset for next turn
    });

    // If it's computer's turn, play automatically
    if (state.players[nextPlayerIndex].isComputer) {
      setTimeout(() => {
        get().computerPlay();
      }, 1500);
    }
  },

  setWhotShapeDemand: (shape: string) => {
    const state = get();
    
    set({ 
      whotShapeDemand: shape 
    });

    // After setting Whot shape, move to next player if it was player's turn
    if (!state.players[state.currentPlayerIndex].isComputer) {
      const nextPlayerIndex = getNextPlayerIndex(
        state.currentPlayerIndex,
        state.players.length,
        state.turnDirection
      );

      set({
        currentPlayerIndex: nextPlayerIndex,
        canEndTurn: false,
      });

      // If it's computer's turn, play automatically
      if (state.players[nextPlayerIndex].isComputer) {
        setTimeout(() => {
          get().computerPlay();
        }, 1500);
      }
    }
  },

  resetGame: () => {
    set({
      players: initialPlayers.map(p => ({ ...p, hand: [] })),
      currentPlayerIndex: 0,
      deck: [],
      discardPile: [],
      gameStatus: "waiting",
      winner: undefined,
      lastPlayedCard: undefined,
      turnDirection: "clockwise",
      cardsToDraw: 0,
      pendingPenalty: 0,
      whotShapeDemand: undefined,
      canEndTurn: false,
    });

    toast.success("Game reset. Start a new game!");
  },
}));