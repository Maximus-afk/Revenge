'use client';
import React from 'react';
import { PlayerBoard as PlayerBoardType, GameAction } from '@/lib/game/types';
import { PlayingCard } from './PlayingCard';
import { DroppableArea } from './DroppableArea';

interface PlayerBoardProps {
  board: PlayerBoardType;
  isActive: boolean;
  onAction: (action: GameAction) => void;
}

export function PlayerBoard({ board, isActive, onAction }: PlayerBoardProps) {
  const handleCardClick = (columnIndex: number, rowIndex: number) => {
    if (!isActive) return;
    
    onAction({
      type: 'PLAY_CARD',
      source: 'board',
      cardIndex: rowIndex,
      destination: 'common',
      column: columnIndex
    });
  };

  return (
    <div className="w-full flex justify-center">
      <div className="inline-flex bg-green-800/50 rounded-lg p-2 gap-2">
        {board.columns.map((column, columnIndex) => (
          <div 
            key={columnIndex} 
            className="flex flex-col"
          >
            {Array.from({ length: board.maxRows }).map((_, rowIndex) => {
              const card = column[rowIndex];
              const isTopOfStack = card && !column.slice(rowIndex + 1).some(c => c);

              return (
                <DroppableArea
                  key={rowIndex}
                  id={`board-${columnIndex}-${rowIndex}`}
                  type="board"
                  index={columnIndex}
                >
                  <div 
                    className={`w-14 h-20 ${!card ? 'border border-dashed border-white/30 rounded-sm' : ''}`}
                    style={{
                      marginTop: rowIndex === 0 ? 0 : '-56px', // 70% overlap (80px * 0.7 = 56px)
                      position: 'relative',
                      zIndex: rowIndex // Stack cards properly
                    }}
                  >
                    {card && (
                      <PlayingCard
                        card={card}
                        onClick={() => handleCardClick(columnIndex, rowIndex)}
                        className={`${isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                        source="board"
                        index={rowIndex}
                        draggable={isActive && isTopOfStack}
                      />
                    )}
                  </div>
                </DroppableArea>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
} 