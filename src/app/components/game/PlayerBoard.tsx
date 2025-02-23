import React from 'react';
import { Card } from './Card';
import { Player } from '@/lib/game/revengeGame';

interface PlayerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  onPlayCard: (cardId: string) => void;
  onSelectBoardColumn: (column: number) => void;
}

export const PlayerBoard: React.FC<PlayerBoardProps> = ({
  player,
  isCurrentPlayer,
  onPlayCard,
  onSelectBoardColumn
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{player.name}</h2>
        <div className="bg-gray-100 px-3 py-1 rounded">
          Cards in pile: {player.pile27.length}
        </div>
      </div>

      {/* Player's board */}
      <div className="grid grid-cols-4 gap-2">
        {player.board.map((column, i) => (
          <div 
            key={i}
            className="min-h-[400px] bg-gray-100 rounded p-2 space-y-1"
            onClick={() => isCurrentPlayer && onSelectBoardColumn(i)}
          >
            {column.map((card) => (
              <Card key={card.id} card={card} />
            ))}
          </div>
        ))}
      </div>

      {/* Player's hand */}
      {isCurrentPlayer && (
        <div className="flex gap-2 mt-4">
          {player.hand.map((card) => (
            <Card 
              key={card.id} 
              card={card} 
              onClick={() => onPlayCard(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 