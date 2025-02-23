'use client';
import React from 'react';
import { Card, GameAction } from '@/lib/game/types';
import { CardPile } from './CardPile';

interface PlayerPileProps {
  pile27: Card[];
  topCard?: Card;
  isActive: boolean;
  onAction: (action: GameAction) => void;
}

export function PlayerPile({ pile27, topCard, isActive, onAction }: PlayerPileProps) {
  const handleTopCardClick = () => {
    if (!isActive || !topCard) return;
    
    onAction({
      type: 'PLAY_CARD',
      source: 'pile',
      cardIndex: pile27.length - 1,
      destination: 'common'
    });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <CardPile
        cards={pile27}
        showTop
        onCardClick={isActive ? handleTopCardClick : undefined}
      />
    </div>
  );
} 