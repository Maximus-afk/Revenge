'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/lib/game/types';
import { PlayingCard } from './PlayingCard';

interface CardPileProps {
  cards: Card[];
  showTop?: boolean;
  faceDown?: boolean;
  className?: string;
  isDraggable?: boolean;
  source?: 'hand' | 'board' | 'pile27';
}

export function CardPile({ 
  cards, 
  showTop = true, 
  faceDown = false,
  className = '',
  isDraggable = false,
  source = 'pile27'
}: CardPileProps) {
  if (cards.length === 0) {
    return <div className="w-14 h-20 bg-gray-700/30 rounded-lg" />;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Stack of cards */}
      <div className="relative">
        {cards.length > 1 && (
          <div className="absolute inset-0 bg-white rounded-lg transform -rotate-3" />
        )}
        {/* Top card */}
        <PlayingCard
          card={cards[cards.length - 1]}
          faceDown={!showTop || faceDown}
          draggable={isDraggable}
          source={source}
          index={cards.length - 1}
        />
      </div>
    </div>
  );
} 