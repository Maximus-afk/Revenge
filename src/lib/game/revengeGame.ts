import { nanoid } from 'nanoid';
import { GameState, PlayerState, Card, PlayerBoard } from './types';
import { createDeck, shuffleDeck, createStartingPiles } from './cardDeck';

// ================ TYPES ================
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Card = {
  suit: Suit;
  value: number;  // 0 for Joker, 1-13 for regular cards (Ace = 1, Jack = 11, Queen = 12, King = 13)
  id: string;
  isJoker?: boolean;
};

export type Player = {
  id: string;
  name: string;
  hand: Card[];
  pile27: Card[];      // The pile of 27 cards to finish
  topPileCard?: Card;  // The face-up card on the 27 pile
  board: Card[][];     // Max 4 columns x 6 rows
};

export type CommonPile = {
  id: string;
  cards: Card[];
  currentValue: number; // 1-13
};

export type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'DRAW_CARDS' }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string; destination: 'common' | 'board'; pileId?: string; column?: number }
  | { type: 'PLAY_PILE_CARD'; playerId: string }
  | { type: 'END_TURN' }
  | { type: 'RESHUFFLE_COMPLETED_PILES' }
  | { type: 'END_GAME'; winnerId: string };

// ================ DECK MANAGEMENT ================
export const createGameDecks = () => {
  const createSingleDeck = (isMainDeck: boolean): Card[] => {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const deck: Card[] = [];

    // Add regular cards
    for (const suit of suits) {
      for (let value = 1; value <= 13; value++) {
        deck.push({
          suit,
          value,
          id: nanoid()
        });
      }
    }

    // Add jokers if it's the main deck
    if (isMainDeck) {
      deck.push({ suit: 'hearts', value: 0, id: nanoid(), isJoker: true });
      deck.push({ suit: 'hearts', value: 0, id: nanoid(), isJoker: true });
    }

    return deck;
  };

  // Create pile27s (the 27-card piles)
  const createPile27 = (): Card[] => {
    const deck = createSingleDeck(false);
    const joker: Card = { suit: 'hearts', value: 0, id: nanoid(), isJoker: true };
    const pile = deck.slice(0, 26);
    pile.push(joker);
    return pile;
  };

  return {
    mainDeck: shuffleDeck(createSingleDeck(true)),
    pile27Player1: createPile27(),
    pile27Player2: createPile27()
  };
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ================ GAME LOGIC ================
export const createInitialGameState = (player1Id: string, player2Id: string): GameState => {
  const { mainDeck, pile27Player1, pile27Player2 } = createGameDecks();
  const { hands, remainingDeck } = dealInitialHands(mainDeck);

  return {
    players: {
      [player1Id]: {
        id: player1Id,
        name: "Player 1",
        hand: hands[0],
        pile27: pile27Player1,
        topPileCard: pile27Player1[pile27Player1.length - 1],
        board: [[], [], [], []]  // 4 empty columns
      },
      [player2Id]: {
        id: player2Id,
        name: "Player 2",
        hand: hands[1],
        pile27: pile27Player2,
        topPileCard: pile27Player2[pile27Player2.length - 1],
        board: [[], [], [], []]
      }
    },
    centerDeck: remainingDeck,
    commonPiles: [],
    currentTurn: player1Id,
    gameStatus: 'waiting'
  };
};

export const dealInitialHands = (deck: Card[]): {
  hands: [Card[], Card[]],
  remainingDeck: Card[]
} => {
  const remainingDeck = [...deck];
  const hands: [Card[], Card[]] = [[], []];
  
  // Deal 6 cards to each player
  for (let i = 0; i < 6; i++) {
    hands[0].push(remainingDeck.pop()!);
    hands[1].push(remainingDeck.pop()!);
  }

  return { hands, remainingDeck };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameStatus: 'playing'
      };

    case 'DRAW_CARDS': {
      const newState = { ...state };
      const player = newState.players[newState.currentTurn];
      
      while (player.hand.length < 6 && newState.centerDeck.length > 0) {
        const card = newState.centerDeck.pop();
        if (card) {
          player.hand.push(card);
        }
      }
      
      return newState;
    }

    case 'PLAY_CARD': {
      // Implementation for playing a card
      // This will need to handle:
      // - Playing to common piles
      // - Playing to personal board
      // - Validating moves
      return state;
    }

    case 'END_TURN': {
      const playerIds = Object.keys(state.players);
      const currentIndex = playerIds.indexOf(state.currentTurn);
      const nextIndex = (currentIndex + 1) % playerIds.length;
      
      return {
        ...state,
        currentTurn: playerIds[nextIndex]
      };
    }

    default:
      return state;
  }
};

// ================ GAME UTILITIES ================
export const canPlayCardToCommonPile = (card: Card, pile: Card[]): boolean => {
  if (card.isJoker) return true;
  if (pile.length === 0) return card.value === 1;
  return card.value === pile[pile.length - 1].value + 1;
};

export const canPlayCardToBoard = (
  card: Card,
  board: Card[][],
  column: number
): boolean => {
  if (column < 0 || column >= 4) return false;  // Invalid column
  return board[column].length < 6;  // Check if column is not full
};

// Add more utility functions as needed...

export function initializeGame(player1Name: string, player2Name: string): GameState {
  const [pile1, pile2] = createStartingPiles();
  const mainDeck = shuffleDeck(createDeck(true));

  const createInitialPlayerState = (name: string, pile: Card[]): PlayerState => ({
    id: name.toLowerCase(),
    name,
    hand: [],
    board: {
      columns: [[], [], [], []],
      maxColumns: 4,
      maxRows: 6
    },
    pile27: pile,
    topPileCard: pile[pile.length - 1]
  });

  return {
    players: [
      createInitialPlayerState(player1Name, pile1),
      createInitialPlayerState(player2Name, pile2)
    ],
    commonPiles: [],
    centerPile: mainDeck,
    currentPlayerIndex: 0,
    gameStatus: 'waiting'
  };
}

export function dealCards(state: GameState, playerIndex: number): GameState {
  const newState = { ...state };
  const player = newState.players[playerIndex];
  
  while (player.hand.length < 6 && newState.centerPile.length > 0) {
    const card = newState.centerPile.pop();
    if (card) {
      player.hand.push(card);
    }
  }
  
  return newState;
}

export function playCardToCommonPile(
  state: GameState,
  playerIndex: number,
  cardIndex: number,
  pileIndex: number,
  source: 'hand' | 'board' | 'pile'
): GameState {
  const newState = { ...state };
  const player = newState.players[playerIndex];
  let card: Card | undefined;

  // Get card from appropriate source
  switch (source) {
    case 'hand':
      card = player.hand.splice(cardIndex, 1)[0];
      break;
    case 'board':
      // Implementation for playing from board
      break;
    case 'pile':
      if (player.topPileCard) {
        card = player.pile27.pop();
        player.topPileCard = player.pile27[player.pile27.length - 1];
      }
      break;
  }

  if (card && canPlayCardToCommonPile(card, newState.commonPiles[pileIndex])) {
    newState.commonPiles[pileIndex].push(card);
    
    // Check if pile is complete (reached King)
    if (newState.commonPiles[pileIndex][newState.commonPiles[pileIndex].length - 1].value === 13) {
      const completedPile = newState.commonPiles[pileIndex];
      newState.centerPile = [...newState.centerPile, ...shuffleDeck(completedPile)];
      newState.commonPiles[pileIndex] = [];
    }
  }

  return newState;
} 