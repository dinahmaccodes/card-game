import { create } from "zustand";
import type { GameState, Player } from "../types/game";
import {
  createDeck,
  dealCards,
  canPlayCard,
  isGameOver,
  getNextPlayerIndex,
  handleSpecialCard,
  getComputerMove,
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
  canEndTurn: true,

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
      canEndTurn: true,
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

    if (
      state.currentPlayerIndex !==
      state.players.findIndex((p) => p.id === playerId)
    ) {
      toast.error("Not your turn!");
      return;
    }

    const cardIndex = player.hand.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) {
      toast.error("Card not found in hand");
      return;
    }

    const card = player.hand[cardIndex];

    if (!canPlayCard(card, state.lastPlayedCard, state.whotShapeDemand)) {
      toast.error("Cannot play this card! Match the shape or number.");
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
      toast.success("Last Card!", { duration: 2000 });
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
      toast.success(`${winner.name} wins!`);
      return;
    }

    // Handle special card effects
    const specialEffects = handleSpecialCard(card);

    // Show notification for Whot card shape demand
    if (card.suit === "whot") {
      toast.success("Whot card played! Choose a shape.", { duration: 3000 });
    }

    // Move to next player
    const nextPlayerIndex = getNextPlayerIndex(
      state.currentPlayerIndex,
      state.players.length,
      state.turnDirection
    );

    set({
      players: updatedPlayers,
      discardPile: newDiscardPile,
      lastPlayedCard: card,
      currentPlayerIndex: nextPlayerIndex,
      whotShapeDemand: card.suit === "whot" ? undefined : state.whotShapeDemand,
      ...specialEffects,
    });

    // If it's computer's turn, play automatically after a delay
    if (updatedPlayers[nextPlayerIndex].isComputer) {
      setTimeout(() => {
        get().computerPlay();
      }, 1000);
    }
  },

  drawCard: (playerId: string) => {
    const state = get();
    const player = state.players.find((p) => p.id === playerId);

    if (!player || state.gameStatus !== "playing") {
      toast.error("Cannot draw card at this time");
      return;
    }

    if (
      state.currentPlayerIndex !==
      state.players.findIndex((p) => p.id === playerId)
    ) {
      toast.error("Not your turn!");
      return;
    }

    if (state.deck.length === 0) {
      toast.error("No cards left in deck!");
      return;
    }

    const [drawnCard, ...newDeck] = state.deck;
    const updatedPlayers = state.players.map((p) =>
      p.id === playerId ? { ...p, hand: [...p.hand, drawnCard] } : p
    );

    set({
      players: updatedPlayers,
      deck: newDeck,
    });

    // Check for "Last Card" notification
    if (updatedPlayers.find((p) => p.id === playerId)?.hand.length === 1) {
      toast.success("Last Card!", { duration: 2000 });
    }

    // Move to next player
    const nextPlayerIndex = getNextPlayerIndex(
      state.currentPlayerIndex,
      state.players.length,
      state.turnDirection
    );

    set({
      currentPlayerIndex: nextPlayerIndex,
      pendingPenalty: 0, // Reset penalty after drawing
    });

    // If it's computer's turn, play automatically after a delay
    if (updatedPlayers[nextPlayerIndex].isComputer) {
      setTimeout(() => {
        get().computerPlay();
      }, 1000);
    }
  },

  computerPlay: () => {
    const state = get();
    const computer = state.players[state.currentPlayerIndex];

    if (!computer.isComputer || state.gameStatus !== "playing") {
      return;
    }

    const move = getComputerMove(
      computer.hand,
      state.lastPlayedCard,
      state.whotShapeDemand
    );

    if (move.action === "play" && move.cardId) {
      const card = computer.hand.find((c) => c.id === move.cardId);
      get().playCard(move.cardId, computer.id);

      // Show notification for Whot card shape demand
      if (card?.suit === "whot") {
        setTimeout(() => {
          const shapes = ["circle", "triangle", "square", "star", "cross"];
          const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
          get().setWhotShapeDemand(randomShape);
          toast.success(`Computer demands: ${randomShape}`, { duration: 3000 });
        }, 500);
      }
    } else {
      get().drawCard(computer.id);
    }
  },

  endTurn: () => {
    const state = get();
    if (!state.canEndTurn || state.gameStatus !== "playing") {
      return;
    }

    const nextPlayerIndex = getNextPlayerIndex(
      state.currentPlayerIndex,
      state.players.length,
      state.turnDirection
    );

    set({
      currentPlayerIndex: nextPlayerIndex,
      canEndTurn: true,
    });

    // If it's computer's turn, play automatically after a delay
    if (state.players[nextPlayerIndex].isComputer) {
      setTimeout(() => {
        get().computerPlay();
      }, 1000);
    }
  },

  setWhotShapeDemand: (shape: string) => {
    set({ whotShapeDemand: shape });
  },

  resetGame: () => {
    set({
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
      canEndTurn: true,
    });

    toast.success("Game reset");
  },
}));
