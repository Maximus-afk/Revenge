'use client';
import React, { createContext, useContext, useState } from 'react';

interface GamePerspectiveContextType {
  currentPerspective: number;
  switchPerspective: (playerIndex: number) => void;
}

const GamePerspectiveContext = createContext<GamePerspectiveContextType>({
  currentPerspective: 0,
  switchPerspective: () => {}
});

export function GamePerspectiveProvider({ children }: { children: React.ReactNode }) {
  const [currentPerspective, setCurrentPerspective] = useState(0);

  const switchPerspective = (playerIndex: number) => {
    setCurrentPerspective(playerIndex);
  };

  return (
    <GamePerspectiveContext.Provider value={{ currentPerspective, switchPerspective }}>
      {children}
    </GamePerspectiveContext.Provider>
  );
}

export const useGamePerspective = () => useContext(GamePerspectiveContext); 