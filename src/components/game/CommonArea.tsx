import { Card } from '@/lib/game/types';
import { CardPile } from './CardPile';

interface CommonAreaProps {
  commonPiles: Card[][];
  centerPile: Card[];
}

export function CommonArea({ commonPiles, centerPile }: CommonAreaProps) {
  return (
    <div className="my-8 p-4 bg-gray-800 rounded-lg">
      <div className="flex justify-center gap-4">
        {/* Center deck */}
        <CardPile cards={centerPile} faceDown />
        
        {/* Common building piles */}
        <div className="flex gap-4">
          {commonPiles.map((pile, index) => (
            <CardPile 
              key={index}
              cards={pile}
              showTop
            />
          ))}
        </div>
      </div>
    </div>
  );
} 