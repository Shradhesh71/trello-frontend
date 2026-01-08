'use client';

import { useState } from 'react';
import { Tag, Plus, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '@/lib/api';

interface CardLabelsProps {
  cardId: string;
}

const LABEL_COLORS = [
  { name: 'Green', value: '#61bd4f' },
  { name: 'Yellow', value: '#f2d600' },
  { name: 'Orange', value: '#ff9f1a' },
  { name: 'Red', value: '#eb5a46' },
  { name: 'Purple', value: '#c377e0' },
  { name: 'Blue', value: '#0079bf' },
  { name: 'Sky', value: '#00c2e0' },
  { name: 'Lime', value: '#51e898' },
  { name: 'Pink', value: '#ff78cb' },
  { name: 'Black', value: '#344563' },
];

export function CardLabels({ cardId }: CardLabelsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].value);
  const queryClient = useQueryClient();

  const { data: allLabels } = useQuery({
    queryKey: ['labels'],
    queryFn: () => labelsApi.getAll(),
  });

  const { data: cardLabels } = useQuery({
    queryKey: ['labels', 'card', cardId],
    queryFn: () => labelsApi.getByCardId(cardId),
  });

  const assignMutation = useMutation({
    mutationFn: labelsApi.assign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
      queryClient.invalidateQueries({ queryKey: ['labels', 'card', cardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ cardId, labelId }: { cardId: string; labelId: string }) =>
      labelsApi.remove(cardId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
      queryClient.invalidateQueries({ queryKey: ['labels', 'card', cardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: labelsApi.create,
    onSuccess: (newLabel) => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      assignMutation.mutate({ cardId, labelId: newLabel.id });
      setNewLabelName('');
      setIsCreating(false);
    },
  });

  const handleToggleLabel = (labelId: string) => {
    const isAssigned = cardLabels?.some((l) => l.id === labelId);
    if (isAssigned) {
      removeMutation.mutate({ cardId, labelId });
    } else {
      assignMutation.mutate({ cardId, labelId });
    }
  };

  const handleCreateLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabelName.trim()) {
      createMutation.mutate({
        name: newLabelName.trim(),
        color: selectedColor,
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm text-left bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-2"
      >
        <Tag className="w-4 h-4" />
        Labels
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 w-72">
            <div className="px-3 pb-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 text-center">Labels</h3>
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              {allLabels?.map((label) => {
                const isAssigned = cardLabels?.some((l) => l.id === label.id);
                return (
                  <button
                    key={label.id}
                    onClick={() => handleToggleLabel(label.id)}
                    className="w-full px-3 py-2 mb-1 rounded flex items-center justify-between hover:bg-gray-100"
                    style={{ backgroundColor: label.color + '20' }}
                  >
                    <span
                      className="px-3 py-1 rounded text-white text-sm font-medium flex-1 text-left"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                    {isAssigned && <Check className="w-4 h-4 ml-2" />}
                  </button>
                );
              })}
            </div>

            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 border-t border-gray-200 mt-2"
              >
                <Plus className="w-4 h-4" />
                Create a new label
              </button>
            ) : (
              <form onSubmit={handleCreateLabel} className="p-3 border-t border-gray-200 mt-2">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Label name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={`h-8 rounded ${
                        selectedColor === color.value ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!newLabelName.trim()}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewLabelName('');
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
