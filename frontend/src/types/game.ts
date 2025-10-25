export interface Card {
  id: string;
  suit: "circle" | "triangle" | "square" | "star" | "cross" | "whot";
  number: number;
  isSpecial?: boolean;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isComputer: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  gameStatus: "waiting" | "playing" | "finished";
  winner?: string;
  lastPlayedCard?: Card;
  turnDirection: "clockwise" | "counterclockwise";
  cardsToDraw: number;
  pendingPenalty: number; // Cards to draw due to Pick 2/3
  whotShapeDemand?: string; // Shape demanded by Whot card
  canEndTurn: boolean; // Whether player can end turn manually
}

export interface GameAction {
  type: "PLAY_CARD" | "DRAW_CARD" | "START_GAME" | "RESET_GAME" | "SKIP_TURN";
  payload?: {
    cardId?: string;
    playerId?: string;
  };
}

export interface CardProps {
  card: Card;
  isFaceUp?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface GameRules {
  maxCardsPerHand: number;
  specialCards: {
    [key: number]: {
      effect: string;
      description: string;
    };
  };
}
