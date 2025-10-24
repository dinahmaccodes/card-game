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
    // Regular cards (1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14) - No 6 or 9
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
      suit: "whot" as Card["suit"],
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

// Check if a card can be played
export const canPlayCard = (
  card: Card,
  lastPlayedCard?: Card,
  whotShapeDemand?: string
): boolean => {
  if (!lastPlayedCard) return true;

  // Whot cards can always be played
  if (card.suit === "whot") return true;

  // If there's a Whot shape demand, only that shape can be played
  if (whotShapeDemand) {
    return card.suit === whotShapeDemand || (card.suit as string) === "whot";
  }

  // Special defense rules for action cards
  if (lastPlayedCard.isSpecial) {
    // Only allow stacking the same action card as defense
    if (lastPlayedCard.number === 2 && card.number === 2) return true; // Pick Two on Pick Two
    if (lastPlayedCard.number === 5 && card.number === 5) return true; // Pick Three on Pick Three
    if (lastPlayedCard.number === 1 && card.number === 1) return true; // Hold On on Hold On
    if (lastPlayedCard.number === 8 && card.number === 8) return true; // Suspension on Suspension
    if (lastPlayedCard.number === 14 && card.number === 14) return true; // General Market on General Market
    // For other special cards, normal matching rules apply
  }

  return (
    card.suit === lastPlayedCard.suit ||
    card.number === lastPlayedCard.number ||
    !!card.isSpecial
  );
};

// Get playable cards from a hand
export const getPlayableCards = (
  hand: Card[],
  lastPlayedCard?: Card,
  whotShapeDemand?: string
): Card[] => {
  return hand.filter((card) =>
    canPlayCard(card, lastPlayedCard, whotShapeDemand)
  );
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

// Handle special card effects
export const handleSpecialCard = (card: Card): Partial<GameState> => {
  switch (card.number) {
    case 1: // Hold On
      return { pendingPenalty: 0, canEndTurn: false }; // Skip next player
    case 2: // Pick Two
      return { pendingPenalty: 2, canEndTurn: false }; // Next player draws 2 cards
    case 5: // Pick Three
      return { pendingPenalty: 3, canEndTurn: false }; // Next player draws 3 cards
    case 8: // Suspension
      return { pendingPenalty: 0, canEndTurn: false }; // Skip next player
    case 14: // General Market
      return { pendingPenalty: 0, canEndTurn: false }; // All players draw 1 card
    case 20: // Whot
      return { pendingPenalty: 0, canEndTurn: false }; // Wild card - player chooses shape
    default:
      return { pendingPenalty: 0, canEndTurn: true };
  }
};

// Simple AI logic for computer player
export const getComputerMove = (
  hand: Card[],
  lastPlayedCard?: Card,
  whotShapeDemand?: string
): { action: "play" | "draw"; cardId?: string } => {
  const playableCards = getPlayableCards(hand, lastPlayedCard, whotShapeDemand);

  if (playableCards.length > 0) {
    // Play a random playable card
    const randomCard =
      playableCards[Math.floor(Math.random() * playableCards.length)];
    return { action: "play", cardId: randomCard.id };
  }

  return { action: "draw" };
};
