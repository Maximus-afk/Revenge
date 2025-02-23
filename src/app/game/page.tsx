import { GameBoard } from '@/components/game/GameBoard';

export default function GamePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Revenge Card Game</h1>
      <GameBoard />
    </div>
  );
} 