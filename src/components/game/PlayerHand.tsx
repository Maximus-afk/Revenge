'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Card, GameAction } from '@/lib/game/types';
import { PlayingCard } from './PlayingCard';

interface PlayerHandProps {
  hand: Card[];
  isActive: boolean;
  onAction: (action: GameAction) => void;
}

export function PlayerHand({ hand, isActive, onAction }: PlayerHandProps) {
  const handleCardClick = (cardIndex: number) => {
    if (!isActive) return;
    onAction({
      type: 'PLAY_CARD',
      source: 'hand',
      cardIndex,
      destination: 'common'
    });
  };

  return (
    <div className="flex justify-center">
      <div className="flex gap-2">
        {hand.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <PlayingCard
              card={card}
              onClick={() => handleCardClick(index)}
              className={isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              draggable={isActive}
              source="hand"
              index={index}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 