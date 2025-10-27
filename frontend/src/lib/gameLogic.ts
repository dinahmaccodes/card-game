import type { Card, GameState, Player } from "../types/game";

// Create a standard Whot deck
export const createDeck = (): Card[] => {
  const suits: Card["suit"][] = [
    "circle",
    "triangle",
    "square",
    "star",
    "cross",
  ];
  const deck: Card[] = [];

  suits.forEach((suit) => {
    // Regular cards (1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14)
    const numbers = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14];
    numbers.forEach((number) => {
      deck.push({
        id: `${suit}-${number}`,
        suit,
        number,
        isSpecial:
          number === 1 ||
          number === 2 ||
          number === 5 ||
          number === 8 ||
          number === 14,
      });
    });
  });

  // Add 5 Whot cards (wild cards)
  for (let i = 1; i <= 5; i++) {
    deck.push({
      id: `whot-${i}`,
      suit: "whot",
      number: 20,
      isSpecial: true,
    });
  }

  return shuffleDeck(deck);
};

// Shuffle deck using Fisher-Yates algorithm
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal cards to players
export const dealCards = (
  deck: Card[],
  players: Player[],
  cardsPerPlayer: number = 5
): Card[] => {
  const remainingDeck = [...deck];

  players.forEach((player) => {
    player.hand = [];
    for (let i = 0; i < cardsPerPlayer; i++) {
      if (remainingDeck.length > 0) {
        player.hand.push(remainingDeck.pop()!);
      }
    }
  });

  return remainingDeck;
};

export const canPlayCard = (
  card: Card,
  lastPlayedCard: Card | undefined,
  gameState?: Partial<GameState>
): boolean => {
  // First card of the game - anything can be played
  if (!lastPlayedCard) return true;

  // Provide defaults for gameState properties
  const pendingPenalty = gameState?.pendingPenalty ?? 0;
  const whotShapeDemand = gameState?.whotShapeDemand;

  // CRITICAL FIX: If there's a pending penalty (Pick 2/3), ONLY Pick 2 can be played
  // Whot cards CANNOT be used to defend against Pick penalties!
  if (pendingPenalty > 0) {
    return card.number === 2; // Only Pick 2 is allowed, NOT Whot!
  }

  // Whot cards can be played ONLY if there's no Pick penalty
  if (card.suit === "whot") return true;

  // If there's a Whot shape demand, ONLY that shape (or another Whot) can be played
  if (whotShapeDemand && whotShapeDemand !== "whot") {
    return card.suit === whotShapeDemand;
  }

  // Normal matching rules: must match shape OR number
  return (
    card.suit === lastPlayedCard.suit || card.number === lastPlayedCard.number
  );
};

// Get playable cards from a hand - FIXED
export const getPlayableCards = (
  hand: Card[],
  lastPlayedCard: Card | undefined,
  gameState: Partial<GameState>
): Card[] => {
  return hand.filter((card) => canPlayCard(card, lastPlayedCard, gameState));
};

// Draw multiple cards from deck - FIXED
export const drawCards = (
  deck: Card[],
  count: number
): { drawnCards: Card[]; remainingDeck: Card[] } => {
  const remainingDeck = [...deck];
  const drawnCards: Card[] = [];

  for (let i = 0; i < count; i++) {
    if (remainingDeck.length > 0) {
      const card = remainingDeck.pop();
      if (card) drawnCards.push(card);
    } else {
      // If deck runs out, we could reshuffle discard pile here
      break;
    }
  }

  return { drawnCards, remainingDeck };
};

// Handle special card effects - FIXED
export const applySpecialCardEffect = (
  card: Card,
  gameState: GameState
): Partial<GameState> => {
  const updates: Partial<GameState> = {};

  switch (card.number) {
    case 1: // Hold On - skip next player
      updates.pendingPenalty = 0;
      // Skip will be handled in turn advancement
      break;

    case 2: {
      // Pick Two - accumulate penalty
      const currentPenalty = gameState.pendingPenalty || 0;
      updates.pendingPenalty = currentPenalty + 2;
      break;
    }

    case 5: // Pick Three - set penalty
      updates.pendingPenalty = 3;
      break;

    case 8: // Suspension - skip next player
      updates.pendingPenalty = 0;
      // Skip will be handled in turn advancement
      break;

    case 14: // General Market - everyone draws 1
      // This needs to be handled separately as it affects all players
      updates.pendingPenalty = -1; // Special marker for General Market
      break;

    case 20: // Whot - wild card
      updates.pendingPenalty = 0;
      // whotShapeDemand will be set when player chooses shape
      break;

    default:
      updates.pendingPenalty = 0;
      updates.whotShapeDemand = undefined;
      break;
  }

  return updates;
};

// Apply General Market effect - FIXED
export const applyGeneralMarket = (gameState: GameState): GameState => {
  const newState = { ...gameState };

  // Each player (including current player) draws 1 card
  newState.players = newState.players.map((player) => {
    const { drawnCards, remainingDeck } = drawCards(newState.deck, 1);
    newState.deck = remainingDeck;

    return {
      ...player,
      hand: [...player.hand, ...drawnCards],
    };
  });

  newState.pendingPenalty = 0;
  return newState;
};

// Apply Pick penalty - FIXED
export const applyPickPenalty = (
  player: Player,
  deck: Card[],
  penaltyAmount: number
): { updatedPlayer: Player; remainingDeck: Card[] } => {
  const { drawnCards, remainingDeck } = drawCards(deck, penaltyAmount);

  const updatedPlayer = {
    ...player,
    hand: [...player.hand, ...drawnCards],
  };

  return { updatedPlayer, remainingDeck };
};

// Check if game is over
export const isGameOver = (players: Player[]): Player | null => {
  return players.find((player) => player.hand.length === 0) || null;
};

// Get next player index
export const getNextPlayerIndex = (
  currentIndex: number,
  totalPlayers: number,
  direction: "clockwise" | "counterclockwise" = "clockwise"
): number => {
  if (direction === "clockwise") {
    return (currentIndex + 1) % totalPlayers;
  } else {
    return currentIndex === 0 ? totalPlayers - 1 : currentIndex - 1;
  }
};

// Skip next player (for Hold On / Suspension)
export const skipNextPlayer = (
  currentIndex: number,
  totalPlayers: number,
  direction: "clockwise" | "counterclockwise" = "clockwise"
): number => {
  const nextIndex = getNextPlayerIndex(currentIndex, totalPlayers, direction);
  return getNextPlayerIndex(nextIndex, totalPlayers, direction);
};

// Computer AI - FIXED and SMARTER
export const getComputerMove = (
  hand: Card[],
  gameState: GameState
): {
  action: "play" | "draw";
  cardId?: string;
  chosenShape?: Card["suit"];
} => {
  const { lastPlayedCard, pendingPenalty = 0, whotShapeDemand } = gameState;

  // Get all playable cards
  const playableCards = getPlayableCards(hand, lastPlayedCard, {
    pendingPenalty,
    whotShapeDemand,
  });

  // If no playable cards, must draw
  if (playableCards.length === 0) {
    return { action: "draw" };
  }

  // Strategy: Prioritize playing special cards

  // 1. If Pick 2/3 is active, try to defend with Pick 2
  if (pendingPenalty > 0) {
    const defensePick2 = playableCards.find((c) => c.number === 2);
    if (defensePick2) {
      return { action: "play", cardId: defensePick2.id };
    }
    // If can't defend, must draw (but this shouldn't happen as we filtered)
    return { action: "draw" };
  }

  // 2. Prioritize getting rid of high-value/special cards
  const specialCards = playableCards.filter((c) => c.isSpecial);
  const highValueCards = playableCards.filter((c) => c.number >= 10);

  let cardToPlay: Card | undefined;

  // Play special cards first (except save Whot for emergencies)
  const nonWhotSpecials = specialCards.filter((c) => c.suit !== "whot");
  if (nonWhotSpecials.length > 0) {
    cardToPlay = nonWhotSpecials[0];
  }
  // Then play high value cards
  else if (highValueCards.length > 0) {
    cardToPlay = highValueCards[0];
  }
  // Play any random card (including Whot if necessary)
  else {
    cardToPlay =
      playableCards[Math.floor(Math.random() * playableCards.length)];
  }

  // If playing a Whot card, choose the most common shape in hand
  let chosenShape: Card["suit"] | undefined;
  if (cardToPlay.suit === "whot") {
    chosenShape = getMostCommonShape(hand);
  }

  return {
    action: "play",
    cardId: cardToPlay.id,
    chosenShape,
  };
};

// Helper: Get most common shape in hand (for Whot card strategy)
const getMostCommonShape = (hand: Card[]): Card["suit"] => {
  const shapeCounts: Record<string, number> = {
    circle: 0,
    triangle: 0,
    square: 0,
    star: 0,
    cross: 0,
  };

  hand.forEach((card) => {
    if (card.suit !== "whot") {
      shapeCounts[card.suit] = (shapeCounts[card.suit] || 0) + 1;
    }
  });

  // Find shape with highest count
  let maxCount = 0;
  let mostCommonShape: Card["suit"] = "circle";

  Object.entries(shapeCounts).forEach(([shape, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonShape = shape as Card["suit"];
    }
  });

  return mostCommonShape;
};

// Validate card play attempt - FIXED
export const validateCardPlay = (
  card: Card,
  gameState: Partial<GameState>
): { valid: boolean; reason?: string } => {
  const { lastPlayedCard, pendingPenalty = 0, whotShapeDemand } = gameState;

  // CRITICAL FIX: If Pick penalty is active, ONLY Pick 2 can be played
  // Whot cards are NOT allowed as defense!
  if (pendingPenalty > 0) {
    if (card.number !== 2) {
      return {
        valid: false,
        reason: `Pick ${pendingPenalty} is active! Only Pick 2 can defend. Play Pick 2 or draw ${pendingPenalty} cards.`,
      };
    }
    // If it IS Pick 2, it's valid
    return { valid: true };
  }

  // Whot cards can be played (but only when no Pick penalty is active)
  if (card.suit === "whot") return { valid: true };

  // If Whot shape is demanded, must match that shape (or play another Whot)
  if (whotShapeDemand && whotShapeDemand !== "whot") {
    if (card.suit !== whotShapeDemand) {
      return {
        valid: false,
        reason: `You must play a ${whotShapeDemand.toUpperCase()} card or a Whot card!`,
      };
    }
    return { valid: true };
  }

  // Normal matching rules
  if (!lastPlayedCard) return { valid: true };

  const matches =
    card.suit === lastPlayedCard.suit || card.number === lastPlayedCard.number;

  if (!matches) {
    return {
      valid: false,
      reason: `Card must match either the SHAPE (${lastPlayedCard.suit.toUpperCase()}) or NUMBER (${
        lastPlayedCard.number
      })!`,
    };
  }

  return { valid: true };
};

// Check if player needs to draw penalty cards
export const needsToDrawPenalty = (
  hand: Card[],
  pendingPenalty: number
): boolean => {
  if (pendingPenalty === 0) return false;

  // Check if player has Pick 2 to defend
  const hasPick2 = hand.some((card) => card.number === 2);

  return !hasPick2;
};

// Reshuffle discard pile into deck when deck is empty
export const reshuffleDiscardPile = (
  deck: Card[],
  discardPile: Card[]
): { newDeck: Card[]; newDiscardPile: Card[] } => {
  if (deck.length > 0) {
    return { newDeck: deck, newDiscardPile: discardPile };
  }

  // Keep the last played card, shuffle the rest
  const lastCard = discardPile[discardPile.length - 1];
  const cardsToShuffle = discardPile.slice(0, -1);

  return {
    newDeck: shuffleDeck(cardsToShuffle),
    newDiscardPile: lastCard ? [lastCard] : [],
  };
};
