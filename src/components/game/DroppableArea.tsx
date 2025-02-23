'use client';
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableAreaProps {
  id: string;
  type: 'common' | 'board';
  index: number;
  children: React.ReactNode;
  className?: string;
}

export function DroppableArea({ id, type, index, children, className = '' }: DroppableAreaProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type,
      index
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-green-500/20' : ''} transition-colors rounded-lg`}
    >
      {children}
    </div>
  );
} 