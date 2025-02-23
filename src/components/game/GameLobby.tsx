'use client';
import { useState } from 'react';
import { createGame, joinGame } from '@/lib/firebase/gameUtils';

interface GameLobbyProps {
  onGameStart: (gameId: string, playerName: string, playerIndex: number) => void;
}

export function GameLobby({ onGameStart }: GameLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    if (!playerName) {
      setError('Please enter your name');
      return;
    }
    
    try {
      const newGameId = await createGame(playerName);
      onGameStart(newGameId, playerName, 0);
    } catch (err) {
      setError('Failed to create game');
    }
  };

  const handleJoinGame = async () => {
    if (!playerName || !gameId) {
      setError('Please enter your name and game code');
      return;
    }

    try {
      const success = await joinGame(gameId, playerName);
      if (success) {
        onGameStart(gameId, playerName, 1);
      } else {
        setError('Game not found or already started');
      }
    } catch (err) {
      setError('Failed to join game');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-green-900 rounded-lg">
      <h2 className="text-2xl font-bold">Join Game</h2>
      
      {error && (
        <div className="text-red-500">{error}</div>
      )}

      <input
        type="text"
        placeholder="Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="px-4 py-2 rounded bg-white/10 text-white"
      />

      <div className="flex gap-4">
        <button
          onClick={handleCreateGame}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Create New Game
        </button>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Game Code"
            value={gameId}
            onChange={(e) => setGameId(e.target.value.toUpperCase())}
            className="px-4 py-2 rounded bg-white/10 text-white w-32"
          />
          <button
            onClick={handleJoinGame}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
} 