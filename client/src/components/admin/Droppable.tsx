import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function Droppable({ id, children, className = '' }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`${className} ${isOver ? 'ring-2 ring-primary/50' : ''}`}
    >
      {children}
    </div>
  );
}