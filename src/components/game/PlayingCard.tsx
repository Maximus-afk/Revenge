'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/lib/game/types';

interface PlayingCardProps {
  card: Card;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  draggable?: boolean;
  source: 'hand' | 'board' | 'pile27';
  index?: number;
}

export function PlayingCard({
  card,
  faceDown,
  onClick,
  className = '',
  draggable = true,
  source,
  index
}: PlayingCardProps) {
  // Guard clause for undefined card
  if (!card || !card.id) {
    return <div className="w-14 h-20 bg-gray-700 rounded-lg" />;
  }

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${source}-${card.id}`,
    data: {
      card,
      source,
      index
    },
    disabled: !draggable
  });

  const getSuitSymbol = (suit: string): string => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      case 'joker': return '★';
      default: return '';
    }
  };

  const getSuitColor = (suit: string): string => {
    if (suit === 'joker') return 'text-purple-500';
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black';
  };

  const getRankDisplay = (rank: number, isJoker: boolean): string => {
    if (isJoker) return 'J';
    if (rank === 1) return 'A';
    if (rank === 11) return 'J';
    if (rank === 12) return 'Q';
    if (rank === 13) return 'K';
    return rank.toString();
  };

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      initial={false}
      animate={{
        scale: isDragging ? 1.05 : 1,
        opacity: isDragging ? 0.8 : 1,
        cursor: draggable ? 'grab' : 'default'
      }}
      className={`w-14 h-20 bg-white rounded-lg relative ${className} ${isDragging ? 'z-50' : ''}`}
    >
      {!faceDown && (
        <React.Fragment>
          <div className="absolute top-1 left-1 flex items-center text-sm">
            <span className={getSuitColor(card.suit)}>
              {getRankDisplay(card.rank, card.isJoker)}
              {getSuitSymbol(card.isJoker ? 'joker' : card.suit)}
            </span>
          </div>
          <div className="absolute bottom-1 right-1 flex items-center text-sm rotate-180">
            <span className={getSuitColor(card.suit)}>
              {getRankDisplay(card.rank, card.isJoker)}
              {getSuitSymbol(card.isJoker ? 'joker' : card.suit)}
            </span>
          </div>
        </React.Fragment>
      )}
      {faceDown && (
        <div className="w-full h-full bg-blue-800 rounded-lg" />
      )}
    </motion.div>
  );
} 