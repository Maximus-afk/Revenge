import React from 'react';
import { Card } from './Card';
import { CommonPile } from '@/lib/game/revengeGame';

interface CommonPilesProps {
  piles: CommonPile[];
  onSelectPile: (pileId: string) => void;
}

export const CommonPiles: React.FC<CommonPilesProps> = ({ piles, onSelectPile }) => {
  return (
    <div className="flex gap-4 justify-center my-8">
      {piles.map((pile) => (
        <div 
          key={pile.id}
          onClick={() => onSelectPile(pile.id)}
          className="cursor-pointer"
        >
          {pile.cards.length > 0 ? (
            <Card card={pile.cards[pile.cards.length - 1]} />
          ) : (
            <div className="w-20 h-28 border-2 border-dashed border-gray-300 rounded-lg" />
          )}
        </div>
      ))}
    </div>
  );
}; 