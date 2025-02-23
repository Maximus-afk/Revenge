'use client';
import { PlayerState, GameAction } from '@/lib/game/types';
import { PlayerHand } from './PlayerHand';
import { PlayerBoard } from './PlayerBoard';

interface PlayerAreaProps {
  player: PlayerState;
  isActive: boolean;
  isOpponent: boolean;
  onAction: (action: GameAction) => void;
}

export function PlayerArea({ player, isActive, isOpponent, onAction }: PlayerAreaProps) {
  return (
    <div className={`
      w-full p-4 
      ${isActive ? 'bg-green-900/20' : 'bg-transparent'} 
      rounded-lg
      ${isOpponent ? 'transform -rotate-180' : ''}
    `}>
      <div className="flex flex-col gap-4">
        {/* Player's Board (Cards placed down) */}
        <div className="transform-gpu" style={{
          transform: isOpponent ? 
            'translateZ(20px) rotateX(10deg)' : 
            'translateZ(20px) rotateX(-10deg)'
        }}>
          <PlayerBoard 
            board={player.board}
            isActive={isActive}
            onAction={onAction}
          />
        </div>
        
        {/* Player's Hand */}
        <div className={`
          flex justify-center transform-gpu
          ${isOpponent ? 'opacity-0' : ''}
        `} style={{
          transform: 'translateZ(40px) rotateX(-20deg)'
        }}>
          <PlayerHand 
            hand={player.hand}
            isActive={isActive}
            onAction={onAction}
          />
        </div>

        {/* Opponent's "Floating" Cards */}
        {isOpponent && (
          <div className="absolute top-8 left-1/2 transform-gpu -translate-x-1/2"
            style={{
              transform: 'translateZ(40px) rotateX(20deg) translateY(-20px)'
            }}>
            <div className="flex gap-2">
              {player.hand.map((_, index) => (
                <div 
                  key={index}
                  className="w-24 h-36 bg-blue-800 rounded-lg shadow-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 