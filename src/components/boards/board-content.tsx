'use client';

import { Board, List } from '@/types';
import { ListColumn } from '@/components/lists/list-column';
import { AddListButton } from '@/components/lists/add-list-button';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import { CardItem } from '@/components/cards/card-item';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi, cardsApi } from '@/lib/api';

interface BoardContentProps {
  board: Board;
}

export function BoardContent({ board }: BoardContentProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const updateListPositionMutation = useMutation({
    mutationFn: ({ listId, position }: { listId: string; position: number }) =>
      listsApi.updatePosition(listId, { position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', board.id] });
    },
  });

  const moveCardMutation = useMutation({
    mutationFn: ({ cardId, listId, position }: { cardId: string; listId: string; position: number }) =>
      cardsApi.move(cardId, { listId, position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', board.id] });
    },
  });

  const updateCardPositionMutation = useMutation({
    mutationFn: ({ cardId, position }: { cardId: string; position: number }) =>
      cardsApi.updatePosition(cardId, { position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', board.id] });
    },
  });

  const lists = board.lists || [];
  const sortedLists = [...lists].sort((a, b) => a.position - b.position);

  const activeCard = activeCardId
    ? sortedLists.flatMap(list => list.cards || []).find(card => card.id === activeCardId)
    : null;

  const activeList = activeListId
    ? sortedLists.find(list => list.id === activeListId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'card') {
      setActiveCardId(active.id as string);
    } else if (active.data.current?.type === 'list') {
      setActiveListId(active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeType = active.data.current?.type;

    // Only handle card dragging
    if (activeType !== 'card') return;

    const activeCardId = active.id as string;
    const overId = over.id as string;
    const overType = over.data.current?.type;

    // Don't do anything if dropping on itself
    if (activeCardId === overId) return;

    const activeCard = sortedLists
      .flatMap(list => list.cards || [])
      .find(card => card.id === activeCardId);
    
    if (!activeCard) return;

    // If dragging over a list area (empty space)
    if (overType === 'list') {
      const overListId = overId as string;
      // Card can be dropped here - no action needed on over, just visual feedback
    }
    
    // If dragging over another card
    if (overType === 'card') {
      const overListId = over.data.current?.listId as string;
      // Card can be dropped here - no action needed on over, just visual feedback
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);
    setActiveListId(null);
    
    const { active, over } = event;

    if (!over) return;

    const activeType = active.data.current?.type;
    const overId = over.id as string;
    const overType = over.data.current?.type;

    // Handle list dragging
    if (activeType === 'list') {
      const activeListId = active.id as string;
      const overListId = overId as string;

      if (activeListId !== overListId && overType === 'list') {
        const oldIndex = sortedLists.findIndex(list => list.id === activeListId);
        const newIndex = sortedLists.findIndex(list => list.id === overListId);

        if (oldIndex !== -1 && newIndex !== -1) {
          updateListPositionMutation.mutate({
            listId: activeListId,
            position: newIndex,
          });
        }
      }
      return;
    }

    // Handle card dragging
    if (activeType === 'card') {
      const activeCardId = active.id as string;
      const activeCard = sortedLists
        .flatMap(list => list.cards || [])
        .find(card => card.id === activeCardId);
      
      if (!activeCard) return;

      // Case 1: Dropped on an empty list area
      if (overType === 'list') {
        const targetListId = overId as string;
        const targetList = sortedLists.find(list => list.id === targetListId);
        
        if (!targetList) return;

        const targetCards = targetList.cards || [];
        const newPosition = targetCards.length;

        // Only move if it's a different list
        if (activeCard.listId !== targetListId) {
          moveCardMutation.mutate({
            cardId: activeCardId,
            listId: targetListId,
            position: newPosition,
          });
        }
        return;
      }

      // Case 2: Dropped on another card
      if (overType === 'card') {
        const overCardId = overId as string;
        const overListId = over.data.current?.listId as string;
        
        if (activeCardId === overCardId) return;

        const targetList = sortedLists.find(list => list.id === overListId);
        if (!targetList) return;

        const targetCards = (targetList.cards || []).sort((a, b) => a.position - b.position);
        const overCardIndex = targetCards.findIndex(card => card.id === overCardId);
        
        if (overCardIndex === -1) return;

        // Moving to a different list
        if (activeCard.listId !== overListId) {
          moveCardMutation.mutate({
            cardId: activeCardId,
            listId: overListId,
            position: overCardIndex,
          });
        } else {
          // Reordering within the same list
          const activeCardIndex = targetCards.findIndex(card => card.id === activeCardId);
          
          if (activeCardIndex !== -1 && activeCardIndex !== overCardIndex) {
            updateCardPositionMutation.mutate({
              cardId: activeCardId,
              position: overCardIndex,
            });
          }
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6 overflow-x-auto h-[calc(100vh-73px)]">
        <div className="flex gap-5 min-w-max pb-6 items-start">
          <SortableContext
            items={sortedLists.map(list => list.id)}
            strategy={horizontalListSortingStrategy}
          >
            {sortedLists.map((list) => (
              <ListColumn key={list.id} list={list} boardId={board.id} />
            ))}
          </SortableContext>
          <AddListButton boardId={board.id} position={sortedLists.length} />
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="rotate-3 scale-105 opacity-90">
            <CardItem card={activeCard} />
          </div>
        ) : activeList ? (
          <div className="opacity-80 rotate-2">
            <ListColumn list={activeList} boardId={board.id} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
