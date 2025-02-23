'use client';

import { useCallback, useReducer, useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay 
} from '@dnd-kit/core';
import { PlayerBoard } from './PlayerBoard';
import { GameCenter } from './GameCenter';
import { PlayerHand } from './PlayerHand';
import { GameState, GameAction, Card } from '@/lib/game/types';
import { initializeGame, gameReducer } from '@/lib/game/gameState';
import { PlayingCard } from './PlayingCard';

export default function GameBoardWrapper() {
  return (
    <div className="min-h-screen bg-green-800 p-4" suppressHydrationWarning>
      <GameBoard />
    </div>
  );
}

export function GameBoard() {
  const [gameState, dispatch] = useReducer(gameReducer, null, () => 
    initializeGame('Player 1', 'Player 2')
  );
  const [currentView, setCurrentView] = useState(0);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);

  // Add effect to handle automatic ace placement and view switching
  useEffect(() => {
    dispatch({ type: 'START_TURN' });
    setCurrentView(gameState.currentPlayerIndex); // Automatically switch view to current player
  }, [gameState.currentPlayerIndex]);

  console.log('Initial Game State:', gameState);
  console.log('Player 1 Hand:', gameState.players[0].hand);
  console.log('Player 2 Hand:', gameState.players[1].hand);

  const handleCardPlay = useCallback((action: GameAction) => {
    dispatch(action);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedCard(active.data.current?.card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedCard(null);

    if (!over) return;

    const card = active.data.current?.card;
    const source = active.data.current?.source;
    const sourceIndex = active.data.current?.index;
    const destination = over.data.current?.type;
    const destinationIndex = over.data.current?.index;

    if (!card || !source || !destination) return;

    // Handle card placement based on rules
    dispatch({
      type: 'PLAY_CARD',
      source,
      cardIndex: sourceIndex,
      destination,
      pileIndex: destination === 'common' ? destinationIndex : undefined,
      column: destination === 'board' ? destinationIndex : undefined,
      playerId: gameState.players[currentView].id
    });
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-green-800 p-4">
        {/* View Switcher - Optional now since view switches automatically */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setCurrentView(0)}
            className={`px-3 py-1 rounded ${currentView === 0 ? 'bg-blue-500' : 'bg-blue-700'}`}
          >
            Player 1
          </button>
          <button
            onClick={() => setCurrentView(1)}
            className={`px-3 py-1 rounded ${currentView === 1 ? 'bg-blue-500' : 'bg-blue-700'}`}
          >
            Player 2
          </button>
        </div>

        {/* Game Layout */}
        <div className="flex flex-col gap-8">
          {/* Top Player (Opponent) */}
          <div className={currentView === 1 ? "" : "transform rotate-180"}>
            <PlayerBoard 
              board={gameState.players[currentView === 0 ? 1 : 0].board}
              isActive={gameState.currentPlayerIndex === (currentView === 0 ? 1 : 0)}
              onAction={handleCardPlay}
            />
          </div>

          {/* Center Area with Piles */}
          <div className="flex justify-center">
            <GameCenter 
              centerPile={gameState.centerPile}
              commonPiles={gameState.commonPiles}
              player1Pile={gameState.players[0].pile27}
              player2Pile={gameState.players[1].pile27}
              currentPlayerIndex={gameState.currentPlayerIndex}
              currentView={currentView}
            />
          </div>

          {/* Bottom Player (Current) */}
          <div>
            {/* Player's Board */}
            <PlayerBoard 
              board={gameState.players[currentView].board}
              isActive={gameState.currentPlayerIndex === currentView}
              onAction={handleCardPlay}
            />
            
            {/* Player's Hand */}
            <div className="mt-4">
              <PlayerHand 
                hand={gameState.players[currentView].hand}
                isActive={gameState.currentPlayerIndex === currentView}
                onAction={handleCardPlay}
              />
            </div>
          </div>
        </div>

        <DragOverlay>
          {draggedCard && (
            <PlayingCard
              card={draggedCard}
              draggable={false}
              source="hand"
            />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
} 