'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '@/lib/api';

interface CardDueDateProps {
  cardId: string;
  currentDueDate?: string;
}

export function CardDueDate({ cardId, currentDueDate }: CardDueDateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(
    currentDueDate ? new Date(currentDueDate).toISOString().slice(0, 16) : ''
  );
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setIsOpen(false);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      updateMutation.mutate({
        id: cardId,
        data: { dueDate: new Date(date).toISOString() },
      });
    }
  };

  const handleRemove = () => {
    updateMutation.mutate({
      id: cardId,
      data: { dueDate: undefined },
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm text-left bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Due Date
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 w-72">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Change Due Date</h3>
            <form onSubmit={handleSave}>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!date}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                >
                  Save
                </button>
                {currentDueDate && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
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
