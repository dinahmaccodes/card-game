import { create } from "zustand";
import type { GameState, Player } from "../types/game";
import {
  createDeck,
  dealCards,
  validateCardPlay,
  isGameOver,
  getNextPlayerIndex,
  applySpecialCardEffect,
  applyGeneralMarket,
  applyPickPenalty,
  getComputerMove,
  drawCards,
  reshuffleDiscardPile,
} from "../lib/gameLogic";
import toast from "react-hot-toast";
import { lineraClient } from "../lib/lineraClient";

interface GameStore extends GameState {
  // Actions
  startNewGame: () => Promise<void>;
  playCard: (cardId: string, playerId: string) => Promise<void>;
  drawCard: (playerId: string) => Promise<void>;
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
  canEndTurn: false,
  awaitingHoldOnCard: false,
  awaitingSuspensionCard: false,

  // Actions
  startNewGame: async () => {
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
      awaitingHoldOnCard: false,
      awaitingSuspensionCard: false,
    });

    // Blockchain integration: Join and start match
    try {
      console.log("🔗 Joining match on blockchain...");
      await lineraClient.joinMatch("Player");
      console.log("✅ Joined! Waiting for block confirmation...");

      // Wait for the join block to be processed before starting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("🔗 Starting match on blockchain...");
      await lineraClient.startMatch();

      toast.success("New game started! Synced to blockchain ⛓️");
    } catch (error) {
      console.warn("⚠️ Blockchain sync failed (playing locally):", error);
      toast.success("New game started! You go first.");
    }
  },

  playCard: async (cardId: string, playerId: string) => {
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

      // Blockchain integration: Log the winning move
      if (playerId === "player") {
        try {
          console.log("🔗 Logging winning move to blockchain...");
          await lineraClient.playCard(cardIndex);
        } catch (error) {
          console.warn("⚠️ Blockchain sync failed:", error);
        }
      }

      return;
    }

    // Handle GENERAL MARKET (14) - FIXED: exclude current player
    if (card.number === 14) {
      const stateWithCard = {
        ...state,
        players: updatedPlayers,
        discardPile: newDiscardPile,
        lastPlayedCard: card,
        whotShapeDemand: undefined,
        pendingPenalty: 0,
        awaitingHoldOnCard: false,
        awaitingSuspensionCard: false,
      };

      const newState = applyGeneralMarket(stateWithCard, playerId);

      toast("🛒 General Market! Everyone else draws 1 card.", {
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
        awaitingHoldOnCard: false,
        awaitingSuspensionCard: false,
        // Don't change turn yet - player needs to choose shape
      });

      toast.success("🌟 Whot card played! Choose a shape.", {
        duration: 3000,
      });

      // Player needs to call setWhotShapeDemand() before turn advances
      return;
    }

    // Apply special card effects
    const specialEffects = applySpecialCardEffect(card);

    // HOLD ON (1) - Player MUST play another card immediately
    if (card.number === 1) {
      toast.success("⏸️ Hold On! Play another card of your choice.", {
        duration: 3000,
        icon: "⏸️",
      });

      set({
        players: updatedPlayers,
        discardPile: newDiscardPile,
        lastPlayedCard: card,
        whotShapeDemand: undefined,
        ...specialEffects,
        canEndTurn: false,
        // currentPlayerIndex stays the same - player plays again
      });

      // If it's computer's turn, play automatically
      if (updatedPlayers[state.currentPlayerIndex].isComputer) {
        setTimeout(() => {
          get().computerPlay();
        }, 800);
      }
      return;
    }

    // SUSPENSION (8) - Player plays again with normal matching rules
    if (card.number === 8) {
      const nextPlayer =
        state.players[
          getNextPlayerIndex(
            state.currentPlayerIndex,
            state.players.length,
            state.turnDirection
          )
        ];

      toast(`⏸️ ${nextPlayer.name} suspended! Play again.`, {
        duration: 2000,
        icon: "⏸️",
      });

      set({
        players: updatedPlayers,
        discardPile: newDiscardPile,
        lastPlayedCard: card,
        whotShapeDemand: undefined,
        ...specialEffects,
        canEndTurn: false,
        // currentPlayerIndex stays the same - player plays again
      });

      // If it's computer's turn, play automatically
      if (updatedPlayers[state.currentPlayerIndex].isComputer) {
        setTimeout(() => {
          get().computerPlay();
        }, 800);
      }
      return;
    }

    // PICK 3 (5) - IS defendable, NOT stackable
    if (card.number === 5) {
      // If this is a defense (there was already a Pick 3 penalty)
      if (state.pendingPenalty === 3) {
        toast.success("🛡️ Pick 3 defended! Passing back...", {
          duration: 2000,
        });
      } else {
        toast(`⚠️ Pick 3 activated!`, {
          duration: 3000,
          icon: "⚠️",
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        });
      }

      // Move to next player (penalty stays at 3, doesn't stack)
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
        whotShapeDemand: undefined,
        pendingPenalty: 3, // Stays at 3, doesn't stack
        awaitingHoldOnCard: false,
        awaitingSuspensionCard: false,
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

    // PICK 2 (2) - NOT defendable, NOT stackable
    if (card.number === 2) {
      toast(`⚠️ Pick 2! Next player must draw 2 cards.`, {
        duration: 3000,
        icon: "⚠️",
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });

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
        whotShapeDemand: undefined,
        ...specialEffects,
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

    // NORMAL CARD - move to next player
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
      whotShapeDemand: undefined,
      ...specialEffects,
      canEndTurn: false,
    });

    // Blockchain integration: Track human player's moves
    if (playerId === "player") {
      try {
        console.log(
          `🔗 Syncing card play to blockchain: ${card.suit} ${card.number}`
        );
        await lineraClient.playCard(cardIndex);
        console.log("✅ Card play synced to blockchain");
      } catch (error) {
        console.warn("⚠️ Blockchain sync failed (continuing locally):", error);
      }
    }

    // If it's computer's turn, play automatically
    if (updatedPlayers[nextPlayerIndex].isComputer) {
      setTimeout(() => {
        get().computerPlay();
      }, 1500);
    }
  },

  drawCard: async (playerId: string) => {
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

    // Handle PICK 2 PENALTY (must draw 2, cannot defend)
    if (state.pendingPenalty === 2) {
      const { updatedPlayer, remainingDeck } = applyPickPenalty(
        player,
        currentDeck,
        2
      );

      const updatedPlayers = state.players.map((p) =>
        p.id === playerId ? updatedPlayer : p
      );

      toast.error(`Drew 2 cards! 😓`, {
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
        pendingPenalty: 0,
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

    // Handle PICK 3 PENALTY (can defend or draw 3)
    if (state.pendingPenalty === 3) {
      const { updatedPlayer, remainingDeck } = applyPickPenalty(
        player,
        currentDeck,
        3
      );

      const updatedPlayers = state.players.map((p) =>
        p.id === playerId ? updatedPlayer : p
      );

      toast.error(`Drew 3 cards! 😓`, {
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
        pendingPenalty: 0,
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

    // Blockchain integration: Track human player's draw
    if (playerId === "player") {
      try {
        console.log("🔗 Syncing card draw to blockchain...");
        await lineraClient.drawCard();
        console.log("✅ Card draw synced to blockchain");
      } catch (error) {
        console.warn("⚠️ Blockchain sync failed (continuing locally):", error);
      }
    }

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

    // Get computer's move
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
          const shapeName =
            move.chosenShape!.charAt(0).toUpperCase() +
            move.chosenShape!.slice(1);

          toast.success(`Computer demands: ${shapeName}!`, {
            duration: 3000,
            icon: "🤖",
          });

          // Get updated state and move to next player
          const updatedState = get();
          const nextPlayerIndex = getNextPlayerIndex(
            updatedState.currentPlayerIndex,
            updatedState.players.length,
            updatedState.turnDirection
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
      canEndTurn: false,
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
      whotShapeDemand: shape,
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
      players: initialPlayers.map((p) => ({ ...p, hand: [] })),
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
      awaitingHoldOnCard: false,
      awaitingSuspensionCard: false,
    });

    toast.success("Game reset. Start a new game!");
  },
}));
