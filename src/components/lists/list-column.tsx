'use client';

import { List, UpdateListDto } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardItem } from '@/components/cards/card-item';
import { AddCardButton } from '@/components/cards/add-card-button';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '@/lib/api';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface ListColumnProps {
  list: List;
  boardId: string;
}

export function ListColumn({ list, boardId }: ListColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: list.id,
    data: {
      type: 'list',
      listId: list.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListDto }) => listsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: listsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
    },
  });

  const handleUpdateTitle = () => {
    if (title.trim() && title !== list.title) {
      updateMutation.mutate({ id: list.id, data: { title: title.trim() } });
    } else {
      setTitle(list.title);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete list "${list.title}"? All cards will be deleted.`)) {
      deleteMutation.mutate(list.id);
    }
    setShowMenu(false);
  };

  const cards = list.cards || [];
  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 bg-gray-50/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col flex-shrink-0 border border-gray-200/50 self-start"
    >
      <div className="p-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdateTitle();
                if (e.key === 'Escape') {
                  setTitle(list.title);
                  setIsEditing(false);
                }
              }}
              className="flex-1 px-2 py-1 text-sm font-semibold bg-white border border-blue-500 rounded focus:outline-none"
              autoFocus
            />
          ) : (
            <h3
              {...attributes}
              {...listeners}
              onClick={() => setIsEditing(true)}
              className="flex-1 px-3 py-2 text-sm font-bold text-gray-800 cursor-pointer hover:bg-white/60 rounded-lg transition-colors duration-150"
            >
              {list.title}
            </h3>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/80 rounded-lg transition-all duration-150 hover:scale-110"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20 w-52">
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2.5 text-red-600 font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete list
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          ref={setDroppableRef}
          className="space-y-3 px-2 py-2 min-h-[20px]"
        >
          <SortableContext
            items={sortedCards.map(card => card.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedCards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </SortableContext>
        </div>

        <AddCardButton listId={list.id} position={sortedCards.length} />
      </div>
    </div>
  );
}
