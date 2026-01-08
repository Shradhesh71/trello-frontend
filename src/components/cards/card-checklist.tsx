'use client';

import { useState } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi, checklistItemsApi } from '@/lib/api';
import { Checklist as ChecklistType } from '@/types';

interface CardChecklistProps {
  cardId: string;
  checklist?: ChecklistType;
}

export function CardChecklist({ cardId, checklist }: CardChecklistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const queryClient = useQueryClient();

  const createChecklistMutation = useMutation({
    mutationFn: checklistsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
      setNewChecklistTitle('');
      setIsOpen(false);
    },
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: checklistsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: checklistItemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
      setNewItemTitle('');
      setIsAddingItem(false);
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: checklistItemsApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: checklistItemsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
    },
  });

  const handleCreateChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChecklistTitle.trim()) {
      createChecklistMutation.mutate({
        title: newChecklistTitle.trim(),
        cardId,
      });
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemTitle.trim() && checklist) {
      createItemMutation.mutate({
        title: newItemTitle.trim(),
        checklistId: checklist.id,
      });
    }
  };

  // If checklist is provided, render the full checklist view
  if (checklist) {
    const items = checklist.items || [];
    const completedCount = items.filter((item) => item.isCompleted).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">{checklist.title}</h3>
          </div>
          <button
            onClick={() => deleteChecklistMutation.mutate(checklist.id)}
            className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>{Math.round(progress)}%</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={() => toggleItemMutation.mutate(item.id)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span
                className={`flex-1 text-sm ${
                  item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {item.title}
              </span>
              <button
                onClick={() => deleteItemMutation.mutate(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {!isAddingItem ? (
          <button
            onClick={() => setIsAddingItem(true)}
            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add an item
          </button>
        ) : (
          <form onSubmit={handleCreateItem} className="space-y-2">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Add an item"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newItemTitle.trim()}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemTitle('');
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Otherwise render the button to create a new checklist
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm text-left bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-2"
      >
        <CheckSquare className="w-4 h-4" />
        Checklist
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 w-72">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Checklist</h3>
            <form onSubmit={handleCreateChecklist}>
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Checklist title"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newChecklistTitle.trim()}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setNewChecklistTitle('');
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
