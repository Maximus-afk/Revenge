import { GameState, GameAction, Card } from './types';

// Pure function to handle game state updates
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameStatus: 'playing',
        currentTurn: Object.keys(state.players)[0]
      };
      
    case 'DEAL_CARDS':
      // Implementation will go here
      return state;

    case 'PLAY_CARD':
      // Implementation will go here
      return state;

    case 'END_TURN':
      const playerIds = Object.keys(state.players);
      const currentIndex = playerIds.indexOf(state.currentTurn);
      const nextIndex = (currentIndex + 1) % playerIds.length;
      
      return {
        ...state,
        currentTurn: playerIds[nextIndex]
      };

    default:
      return state;
  }
}

// Helper functions that will work the same whether local or online
export const createInitialState = (playerIds: string[]): GameState => {
  const players = playerIds.reduce((acc, id) => ({
    ...acc,
    [id]: {
      id,
      name: `Player ${id}`,
      hand: [],
      isReady: false
    }
  }), {});

  return {
    players,
    deck: [],
    currentTurn: playerIds[0],
    gameStatus: 'waiting'
  };
}; 