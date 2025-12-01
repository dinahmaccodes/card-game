/**
 * Linera GraphQL Client
 * Wrapper for querying the Linot card game application via GraphQL
 */

interface GameState {
  status: string;
  currentPlayerIndex: number | null;
  topCard: Card | null;
  deckSize: number;
}

interface Card {
  suit: string;
  rank: string;
}

interface MatchConfig {
  maxPlayers: number;
  cardsPerPlayer: number;
}

class LineraClient {
  private graphqlUrl: string;

  constructor() {
    this.graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;
    if (!this.graphqlUrl) {
      throw new Error("VITE_GRAPHQL_URL not set in environment");
    }
  }

  /**
   * Execute a GraphQL query
   */
  private async query<T>(query: string): Promise<T> {
    const response = await fetch(this.graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data as T;
  }

  /**
   * Get the game configuration
   */
  async getConfig(): Promise<MatchConfig> {
    const query = `
      query {
        config {
          maxPlayers
          cardsPerPlayer
        }
      }
    `;
    const data = await this.query<{ config: MatchConfig }>(query);
    return data.config;
  }

  /**
   * Get the current match state
   */
  async getMatchState(): Promise<GameState> {
    const query = `
      query {
        status
        currentPlayerIndex
        topCard {
          suit
          rank
        }
        deckSize
      }
    `;
    const data = await this.query<GameState>(query);
    return data;
  }

  /**
   * Get just the game status
   */
  async getStatus(): Promise<string> {
    const query = `
      query {
        status
      }
    `;
    const data = await this.query<{ status: string }>(query);
    return data.status;
  }

  /**
   * Join the match with a nickname
   */
  async joinMatch(nickname: string): Promise<boolean> {
    const mutation = `
      mutation {
        joinMatch(nickname: "${nickname}")
      }
    `;
    try {
      const data = await this.query<{ joinMatch: boolean }>(mutation);
      return data.joinMatch;
    } catch (error) {
      console.error("Failed to join match:", error);
      throw error;
    }
  }

  /**
   * Start a new match (host only)
   */
  async startMatch(): Promise<boolean> {
    const mutation = `
      mutation {
        startMatch
      }
    `;
    try {
      const data = await this.query<{ startMatch: boolean }>(mutation);
      return data.startMatch;
    } catch (error) {
      console.error("Failed to start match:", error);
      throw error;
    }
  }

  /**
   * Play a card from your hand
   */
  async playCard(cardIndex: number, chosenSuit?: string): Promise<boolean> {
    const suitParam = chosenSuit ? `, chosenSuit: "${chosenSuit}"` : "";
    const mutation = `
      mutation {
        playCard(cardIndex: ${cardIndex}${suitParam})
      }
    `;
    try {
      const data = await this.query<{ playCard: boolean }>(mutation);
      return data.playCard;
    } catch (error) {
      console.error("Failed to play card:", error);
      throw error;
    }
  }

  /**
   * Draw a card from the deck
   */
  async drawCard(): Promise<boolean> {
    const mutation = `
      mutation {
        drawCard
      }
    `;
    try {
      const data = await this.query<{ drawCard: boolean }>(mutation);
      return data.drawCard;
    } catch (error) {
      console.error("Failed to draw card:", error);
      throw error;
    }
  }

  /**
   * Call "Last Card" when you have one card remaining
   */
  async callLastCard(): Promise<boolean> {
    const mutation = `
      mutation {
        callLastCard
      }
    `;
    try {
      const data = await this.query<{ callLastCard: boolean }>(mutation);
      return data.callLastCard;
    } catch (error) {
      console.error("Failed to call last card:", error);
      throw error;
    }
  }

  /**
   * Challenge another player for not calling "Last Card"
   */
  async challengeLastCard(playerIndex: number): Promise<boolean> {
    const mutation = `
      mutation {
        challengeLastCard(playerIndex: ${playerIndex})
      }
    `;
    try {
      const data = await this.query<{ challengeLastCard: boolean }>(mutation);
      return data.challengeLastCard;
    } catch (error) {
      console.error("Failed to challenge last card:", error);
      throw error;
    }
  }

  /**
   * Leave the current match
   */
  async leaveMatch(): Promise<boolean> {
    const mutation = `
      mutation {
        leaveMatch
      }
    `;
    try {
      const data = await this.query<{ leaveMatch: boolean }>(mutation);
      return data.leaveMatch;
    } catch (error) {
      console.error("Failed to leave match:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const lineraClient = new LineraClient();

// Export types
export type { GameState, Card, MatchConfig };
