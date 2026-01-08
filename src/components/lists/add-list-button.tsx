'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '@/lib/api';

interface AddListButtonProps {
  boardId: string;
  position: number;
}

export function AddListButton({ boardId, position }: AddListButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: listsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
      setTitle('');
      setIsAdding(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createMutation.mutate({ title: title.trim(), boardId, position });
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-72 h-20 bg-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
      >
        <Plus className="w-5 h-5" />
        <span>Add a list</span>
      </button>
    );
  }

  return (
    <div className="w-72 bg-gray-50/95 backdrop-blur-sm rounded-xl p-3 flex-shrink-0 shadow-md border border-gray-200/50">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="w-full px-3 py-2.5 text-sm border-2 border-blue-400 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm font-medium"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!title.trim() || createMutation.isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-md hover:shadow-lg"
          >
            Add list
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setTitle('');
            }}
            className="px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
