export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  rank: Rank;
  suit: Suit;
  isJoker?: boolean;
  id: string;
}

export interface PlayerBoard {
  columns: Card[][];
  maxColumns: number;
  maxRows: number;
}

export interface PlayerState {
  id: string;
  name: string;
  hand: Card[];
  board: PlayerBoard;
  pile27: Card[];
  topPileCard?: Card;
}

export interface GameState {
  players: [PlayerState, PlayerState];
  commonPiles: Card[][];
  centerPile: Card[];
  currentPlayerIndex: number;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner?: number;
  needsToDrawCards: boolean;
  hasPlacedOnBoard: boolean;
  isFinalTurn: boolean;
  firstPlayerToFinish?: number;
}

export type GameAction = {
  type: 'START_GAME' | 'DRAW_CARDS' | 'PLAY_CARD' | 'END_TURN' | 'RESHUFFLE_COMPLETED_PILES' | 'START_TURN';
  source?: 'hand' | 'board' | 'pile27';
  cardIndex?: number;
  destination?: 'common' | 'board';
  pileIndex?: number;
  column?: number;
  playerId?: string;
};

// Add these types for online multiplayer
export interface OnlineGameState extends GameState {
  gameId: string;
  status: 'waiting' | 'playing' | 'finished';
  lastUpdated: number;
}

export interface LobbyGame {
  gameId: string;
  hostName: string;
  createdAt: number;
  status: 'waiting' | 'playing' | 'finished';
} 