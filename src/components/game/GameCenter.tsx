'use client';
import React from 'react';
import { Card } from '@/lib/game/types';
import { CardPile } from './CardPile';
import { DroppableArea } from './DroppableArea';

interface GameCenterProps {
  centerPile: Card[];
  commonPiles: Card[][];
  player1Pile: Card[];
  player2Pile: Card[];
  currentPlayerIndex: number;
  currentView: number;
}

export function GameCenter({ 
  centerPile, 
  commonPiles, 
  player1Pile, 
  player2Pile, 
  currentPlayerIndex,
  currentView 
}: GameCenterProps) {
  // Determine which pile goes on which side based on currentView
  // For Player 1's view (currentView === 0):
  // - Player 1's pile should be on the right
  // - Player 2's pile should be on the left
  // For Player 2's view (currentView === 1):
  // - Player 2's pile should be on the right
  // - Player 1's pile should be on the left
  const rightPile = currentView === 0 ? player1Pile : player2Pile;
  const leftPile = currentView === 0 ? player2Pile : player1Pile;
  const isRightPileDraggable = currentView === 0 ? currentPlayerIndex === 0 : currentPlayerIndex === 1;
  const isLeftPileDraggable = currentView === 0 ? currentPlayerIndex === 1 : currentPlayerIndex === 0;

  return (
    <div className="flex justify-center items-center gap-8">
      {/* Left Side Common Piles */}
      <div className="h-[160px] w-[400px] flex items-center justify-end">
        {/* Regular Piles - 3x2 grid */}
        <div className="grid grid-cols-3 grid-rows-2 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <DroppableArea
              key={`left-${index}`}
              id={`common-${index}`}
              type="common"
              index={index}
            >
              <div className="transform rotate-90 origin-center w-14 h-20">
                <CardPile
                  cards={commonPiles[index] || []}
                  showTop={true}
                  isDraggable={false}
                />
              </div>
            </DroppableArea>
          ))}
        </div>
      </div>

      {/* Center Area with Main Piles */}
      <div className="flex items-center gap-4">
        {/* Left Player's Pile */}
        <div className={currentView === 0 ? "transform rotate-180" : ""}>
          <CardPile 
            cards={leftPile} 
            showTop={true}
            isDraggable={isLeftPileDraggable}
            source="pile27"
          />
        </div>

        {/* Center Draw Pile */}
        <CardPile 
          cards={centerPile} 
          showTop={false}
          faceDown={true}
          isDraggable={false}
          className="relative z-10"
        />

        {/* Right Player's Pile */}
        <div className={currentView === 1 ? "transform rotate-180" : ""}>
          <CardPile 
            cards={rightPile} 
            showTop={true}
            isDraggable={isRightPileDraggable}
            source="pile27"
          />
        </div>
      </div>

      {/* Right Side Common Piles */}
      <div className="h-[160px] w-[400px] flex items-center justify-start">
        {/* Regular Piles - 3x2 grid */}
        <div className="grid grid-cols-3 grid-rows-2 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <DroppableArea
              key={`right-${index}`}
              id={`common-${index + 6}`}
              type="common"
              index={index + 6}
            >
              <div className="transform rotate-90 origin-center w-14 h-20">
                <CardPile
                  cards={commonPiles[index + 6] || []}
                  showTop={true}
                  isDraggable={false}
                />
              </div>
            </DroppableArea>
          ))}
        </div>
      </div>
    </div>
  );
} 