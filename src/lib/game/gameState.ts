import { useReducer, useCallback } from 'react';
import { GameState, GameAction } from './types';
import { gameReducer, createInitialState } from './gameLogic';
import { createDeck, shuffleDeck, createStartingPiles } from './cardDeck';
import { canPlayCardToCommonPile, canPlayCardToBoard } from './gameRules';
import { nanoid } from 'nanoid';
import { Card, Rank } from './types';

// This hook can be easily modified later to use Firebase instead of local state
export const useGameState = (playerIds: string[]) => {
  const [state, dispatch] = useReducer(
    gameReducer,
    playerIds,
    createInitialState
  );

  // These methods could later be modified to call Firebase
  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const playCard = useCallback((playerId: string, cardId: string) => {
    dispatch({ type: 'PLAY_CARD', playerId, cardId });
  }, []);

  const endTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, []);

  return {
    gameState: state,
    actions: {
      startGame,
      playCard,
      endTurn
    }
  };
};

export type GameStateHook = ReturnType<typeof useGameState>;

export function initializeGame(player1Name: string, player2Name: string): GameState {
  // Create deterministic IDs for initial state
  const createDeterministicId = (prefix: string, index: number) => `${prefix}-${index}`;
  
  // Create decks with deterministic IDs
  const createDeckWithIds = (withJokers: boolean) => {
    const deck = createDeck(withJokers).map((card, index) => ({
      ...card,
      id: createDeterministicId('card', index)
    }));
    return shuffleDeck(deck);
  };

  // Create piles with deterministic IDs
  const [pile1, pile2] = createStartingPiles().map((pile, pileIndex) => 
    pile.map((card, cardIndex) => ({
      ...card,
      id: createDeterministicId(`pile${pileIndex + 1}`, cardIndex)
    }))
  );

  // Create and shuffle main deck (without jokers initially)
  let mainDeck = createDeckWithIds(false);
  
  // Deal 6 cards to each player
  const player1Hand = mainDeck.splice(0, 6);
  const player2Hand = mainDeck.splice(0, 6);
  
  // Add jokers to remaining deck
  const jokersForMainDeck: Card[] = [
    { suit: 'joker', rank: 0 as Rank, id: 'joker-1', isJoker: true },
    { suit: 'joker', rank: 0 as Rank, id: 'joker-2', isJoker: true }
  ];
  mainDeck = shuffleDeck([...mainDeck, ...jokersForMainDeck]);

  // Determine first player based on personal pile top cards
  const player1TopCard = pile1[pile1.length - 1];
  const player2TopCard = pile2[pile2.length - 1];
  const firstPlayerIndex = (player1TopCard.rank <= player2TopCard.rank) ? 0 : 1;

  return {
    players: [
      {
        id: player1Name.toLowerCase(),
        name: player1Name,
        hand: player1Hand,
        board: {
          columns: [[], [], [], []],
          maxColumns: 4,
          maxRows: 6
        },
        pile27: pile1,
        topPileCard: pile1[pile1.length - 1]
      },
      {
        id: player2Name.toLowerCase(),
        name: player2Name,
        hand: player2Hand,
        board: {
          columns: [[], [], [], []],
          maxColumns: 4,
          maxRows: 6
        },
        pile27: pile2,
        topPileCard: pile2[pile2.length - 1]
      }
    ],
    commonPiles: Array(12).fill(null).map(() => []),
    centerPile: mainDeck,
    currentPlayerIndex: firstPlayerIndex,
    hasPlacedOnBoard: false,
    needsToDrawCards: true,
    gameStatus: 'playing',
    isFinalTurn: false,
    firstPlayerToFinish: undefined
  };
}

function canPlayCard(card: Card, destination: string, targetPile: Card[] | undefined): boolean {
  if (destination === 'common') {
    if (!targetPile?.length) return card.rank === 1;
    const topCard = targetPile[targetPile.length - 1];
    return card.rank === topCard.rank + 1;
  }
  
  if (destination === 'board') {
    return true; // Can always place on board
  }
  
  return false;
}

function placeAcesAutomatically(state: GameState): void {
  const currentPlayer = state.players[state.currentPlayerIndex];
  
  // Find all aces in hand
  const [aces, otherCards] = currentPlayer.hand.reduce(
    ([aces, others]: [Card[], Card[]], card) => {
      if (card.rank === 1) {
        aces.push(card);
      } else {
        others.push(card);
      }
      return [aces, others];
    },
    [[], []]
  );

  // Place each ace in an empty common pile
  aces.forEach(ace => {
    const emptyPileIndex = state.commonPiles.findIndex(pile => !pile || pile.length === 0);
    if (emptyPileIndex !== -1) {
      if (!state.commonPiles[emptyPileIndex]) {
        state.commonPiles[emptyPileIndex] = [];
      }
      state.commonPiles[emptyPileIndex].push(ace);
    }
  });

  // Update player's hand
  currentPlayer.hand = otherCards;
}

function drawCardsToSix(state: GameState): void {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const cardsNeeded = 6 - currentPlayer.hand.length;
  
  if (cardsNeeded > 0) {
    // Check if we need to reshuffle before drawing
    if (state.centerPile.length < cardsNeeded) {
      reshuffleCompletedPiles(state);
    }
    
    // Draw available cards (might be less than needed if reshuffling didn't help)
    const newCards = state.centerPile.splice(0, Math.min(cardsNeeded, state.centerPile.length));
    currentPlayer.hand.push(...newCards);
  }
}

function isCompletePile(pile: Card[]): boolean {
  if (pile.length !== 13) return false;
  return pile.every((card, index) => card.rank === index + 1 || card.isJoker);
}

function reshuffleCompletedPiles(state: GameState): void {
  console.log('Starting reshuffle process');
  
  // Find completed piles
  const completedPileIndices = state.commonPiles
    .map((pile, index) => isCompletePile(pile) ? index : -1)
    .filter(index => index !== -1);

  console.log('Found completed piles:', completedPileIndices);

  if (completedPileIndices.length > 0) {
    // Gather completed piles
    const completedCards = completedPileIndices
      .flatMap(index => state.commonPiles[index]);
    
    // Clear completed piles
    completedPileIndices.forEach(index => {
      state.commonPiles[index] = [];
    });

    // Shuffle and add to center pile
    state.centerPile = shuffleDeck([...completedCards]);
    console.log('Reshuffled completed piles into center deck');
    return;
  }

  // If no completed piles, find highest pile
  const highestPile = state.commonPiles
    .reduce((highest, pile, index) => {
      return pile.length > (highest?.pile.length || 0) ? 
        { index, pile: [...pile] } : highest;
    }, { index: -1, pile: [] as Card[] });

  console.log('Highest pile found:', {
    index: highestPile.index,
    length: highestPile.pile.length
  });

  if (highestPile.index !== -1) {
    // Complete this pile by taking cards from boards
    const neededRanks = Array.from({ length: 13 })
      .map((_, i) => i + 1)
      .filter(rank => !highestPile.pile.some(card => card.rank === rank));

    console.log('Needed ranks:', neededRanks);

    let currentPlayerIndex = 0;
    for (const rank of neededRanks) {
      const player = state.players[currentPlayerIndex];
      // Look for card of needed rank in player's board
      for (let col = 0; col < player.board.columns.length; col++) {
        const cardIndex = player.board.columns[col]
          .findIndex(card => card.rank === rank);
        if (cardIndex !== -1) {
          const card = player.board.columns[col].splice(cardIndex, 1)[0];
          highestPile.pile.push(card);
          console.log(`Found and moved card rank ${rank} from player ${currentPlayerIndex}'s board`);
          break;
        }
      }
      currentPlayerIndex = (currentPlayerIndex + 1) % 2;
    }

    // Shuffle completed pile into center
    state.centerPile = shuffleDeck([...highestPile.pile]);
    state.commonPiles[highestPile.index] = [];
    console.log('Completed and reshuffled highest pile into center deck');
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_TURN': {
      const newState = {
        ...state,
        commonPiles: state.commonPiles.map(pile => [...pile]),
        players: state.players.map(player => ({
          ...player,
          hand: [...player.hand],
          board: {
            ...player.board,
            columns: player.board.columns.map(col => [...col])
          }
        })),
        centerPile: [...state.centerPile]
      };

      // Draw cards if needed
      if (newState.needsToDrawCards) {
        // Add console logs to debug
        console.log('Before drawing cards:', {
          centerPileLength: newState.centerPile.length,
          commonPiles: newState.commonPiles.map(pile => pile.length),
          playerBoards: newState.players.map(p => p.board.columns.map(col => col.length))
        });

        drawCardsToSix(newState);
        newState.needsToDrawCards = false;

        console.log('After drawing cards:', {
          centerPileLength: newState.centerPile.length,
          commonPiles: newState.commonPiles.map(pile => pile.length),
          playerBoards: newState.players.map(p => p.board.columns.map(col => col.length))
        });
      }

      // Place aces automatically
      placeAcesAutomatically(newState);
      newState.hasPlacedOnBoard = false;
      return newState;
    }

    case 'DRAW_CARDS': {
      const newState = { ...state };
      
      // Check if center pile is empty
      if (newState.centerPile.length === 0) {
        reshuffleCompletedPiles(newState);
      }

      // Draw cards if possible
      if (newState.centerPile.length > 0) {
        drawCardsToSix(newState);
      }

      return newState;
    }

    case 'PLAY_CARD': {
      // Don't allow moves if it's not player's turn
      if (action.source !== 'board' && 
          state.currentPlayerIndex !== (action.playerId === state.players[0].id ? 0 : 1)) {
        return state;
      }

      const newState = {
        ...state,
        commonPiles: state.commonPiles.map(pile => [...pile]),
        players: state.players.map(player => ({
          ...player,
          hand: [...player.hand],
          board: {
            ...player.board,
            columns: player.board.columns.map(col => [...col])
          },
          pile27: [...player.pile27]
        })),
        centerPile: [...state.centerPile]
      };

      const currentPlayer = newState.players[newState.currentPlayerIndex];
      let card;

      // Get card from source
      switch (action.source) {
        case 'hand':
          card = currentPlayer.hand[action.cardIndex];
          if (card) {
            currentPlayer.hand.splice(action.cardIndex, 1);
          }
          break;
        case 'pile27':
          if (currentPlayer.pile27.length > 0) {
            card = currentPlayer.pile27[currentPlayer.pile27.length - 1];
            currentPlayer.pile27.pop();
            currentPlayer.topPileCard = currentPlayer.pile27[currentPlayer.pile27.length - 1];
          }
          break;
      }

      if (!card) return state;

      // Validate and place card
      if (action.destination === 'common' && action.pileIndex !== undefined) {
        const targetPile = newState.commonPiles[action.pileIndex];
        const topCard = targetPile[targetPile.length - 1];

        // Debug logging
        console.log('Attempting to place card:', {
          card,
          topCard,
          targetPileIndex: action.pileIndex,
          pileLength: targetPile.length
        });
        
        // Check if placement is valid
        let canPlace = false;
        if (targetPile.length === 0) {
          canPlace = card.rank === 1; // Only aces on empty piles
        } else if (topCard) {
          canPlace = card.rank === topCard.rank + 1; // Next card must be one higher
        }
        canPlace = canPlace || card.isJoker; // Jokers can go anywhere

        console.log('Can place card:', canPlace);

        if (canPlace) {
          newState.commonPiles[action.pileIndex] = [...targetPile, card];
          
          // If hand is empty after playing to common pile, draw new cards
          if (currentPlayer.hand.length === 0) {
            drawCardsToSix(newState);
            placeAcesAutomatically(newState);
          }
          
          // Check for win condition after successful play
          if (currentPlayer.pile27.length === 0 && !newState.firstPlayerToFinish) {
            newState.firstPlayerToFinish = newState.currentPlayerIndex;
            newState.isFinalTurn = true;
          }

          // Check for draw or win after final turn
          if (newState.isFinalTurn && 
              newState.currentPlayerIndex !== newState.firstPlayerToFinish) {
            if (currentPlayer.pile27.length === 0) {
              newState.gameStatus = 'finished';
              newState.winner = undefined; // Draw
            } else {
              newState.gameStatus = 'finished';
              newState.winner = newState.firstPlayerToFinish;
            }
          }

          // Check for full board
          const isCurrentBoardFull = currentPlayer.board.columns
            .every(col => col.length >= currentPlayer.board.maxRows);

          if (isCurrentBoardFull && action.destination === 'board') {
            // End turn if board is full
            newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % 2;
            newState.hasPlacedOnBoard = false;
            newState.needsToDrawCards = true;
          }

          return newState;
        }
      } else if (action.destination === 'board' && action.column !== undefined) {
        const targetColumn = currentPlayer.board.columns[action.column];
        if (targetColumn.length < currentPlayer.board.maxRows) {
          targetColumn.push(card);
          // End turn when placing on board
          newState.hasPlacedOnBoard = true;
          newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % 2;
          newState.hasPlacedOnBoard = false;
          newState.needsToDrawCards = true;
          return newState;
        }
      }

      // If we get here, the move was invalid - return card to source
      if (action.source === 'hand') {
        currentPlayer.hand.splice(action.cardIndex, 0, card);
      } else if (action.source === 'pile27') {
        currentPlayer.pile27.push(card);
        currentPlayer.topPileCard = card;
      }

      return newState;
    }

    default:
      return state;
  }
} 