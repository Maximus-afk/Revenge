import { ref, set, onValue, off, get } from 'firebase/database';
import { database } from './firebase';
import { OnlineGameState, GameState, LobbyGame } from '../game/types';
import { initializeGame } from '../game/gameState';

export async function createGame(hostName: string): Promise<string> {
  const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const gameRef = ref(database, `games/${gameId}`);
  
  const initialGame: OnlineGameState = {
    ...initializeGame(hostName, ''),
    gameId,
    status: 'waiting',
    lastUpdated: Date.now()
  };

  await set(gameRef, initialGame);
  
  const lobbyRef = ref(database, `lobby/${gameId}`);
  await set(lobbyRef, {
    gameId,
    hostName,
    createdAt: Date.now(),
    status: 'waiting'
  });

  return gameId;
}

export async function joinGame(gameId: string, playerName: string): Promise<boolean> {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);
  
  if (!snapshot.exists()) return false;
  
  const game = snapshot.val() as OnlineGameState;
  if (game.status !== 'waiting') return false;

  // Update player 2's name and start the game
  game.players[1].name = playerName;
  game.status = 'playing';
  game.lastUpdated = Date.now();

  await set(gameRef, game);
  await set(ref(database, `lobby/${gameId}/status`), 'playing');
  
  return true;
}

export function subscribeToGame(gameId: string, onUpdate: (game: OnlineGameState) => void) {
  const gameRef = ref(database, `games/${gameId}`);
  onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.val() as OnlineGameState);
    }
  });

  return () => off(gameRef);
}

export async function updateGameState(gameId: string, state: Partial<GameState>) {
  const gameRef = ref(database, `games/${gameId}`);
  await set(gameRef, {
    ...state,
    lastUpdated: Date.now()
  });
} 