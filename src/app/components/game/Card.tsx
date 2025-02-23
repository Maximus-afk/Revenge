import React from 'react';
import { Card as CardType } from '@/lib/game/revengeGame';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  faceDown?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, faceDown }) => {
  if (faceDown) {
    return (
      <div 
        className="w-20 h-28 bg-blue-800 rounded-lg shadow-md cursor-pointer"
        onClick={onClick}
      />
    );
  }

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  };

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  return (
    <div 
      className={`w-20 h-28 bg-white rounded-lg shadow-md flex flex-col justify-between p-2 cursor-pointer
        ${onClick ? 'hover:shadow-lg hover:-translate-y-1 transition-all' : ''}`}
      onClick={onClick}
    >
      <div className={getSuitColor(card.suit)}>
        <div>{card.value === 1 ? 'A' : card.value === 11 ? 'J' : card.value === 12 ? 'Q' : card.value === 13 ? 'K' : card.value}</div>
        <div>{getSuitSymbol(card.suit)}</div>
      </div>
    </div>
  );
}; 