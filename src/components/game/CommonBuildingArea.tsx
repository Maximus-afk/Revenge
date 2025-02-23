'use client';
import { Card } from '@/lib/game/types';
import { CardPile } from './CardPile';

interface CommonBuildingAreaProps {
  piles: Card[][];
}

export function CommonBuildingArea({ piles }: CommonBuildingAreaProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {piles.map((pile, index) => (
        <CardPile 
          key={index}
          cards={pile}
          showTop
        />
      ))}
      {/* Add empty pile slots if needed */}
      {Array.from({ length: Math.max(0, 4 - piles.length) }).map((_, index) => (
        <div 
          key={`empty-${index}`}
          className="w-24 h-36 border-2 border-dashed border-white/20 rounded-lg"
        />
      ))}
    </div>
  );
} 