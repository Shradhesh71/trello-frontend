'use client';

import { Board } from '@/types';
import { X, Palette } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/lib/api';

interface BoardBackgroundModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
}

const backgroundOptions = [
  { name: 'Ocean Blue', color: '#0079bf', gradient: 'from-blue-600 to-purple-600' },
  { name: 'Sunset Orange', color: '#ff9500', gradient: 'from-orange-500 to-pink-600' },
  { name: 'Forest Green', color: '#51e898', gradient: 'from-green-500 to-teal-600' },
  { name: 'Royal Purple', color: '#9f7aea', gradient: 'from-purple-600 to-pink-600' },
  { name: 'Crimson Red', color: '#eb5a46', gradient: 'from-red-500 to-pink-600' },
  { name: 'Sky Blue', color: '#00c2e0', gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Emerald Green', color: '#61bd4f', gradient: 'from-emerald-500 to-green-600' },
  { name: 'Sunset Pink', color: '#ff78cb', gradient: 'from-pink-500 to-rose-600' },
  { name: 'Gold Yellow', color: '#f2d600', gradient: 'from-yellow-500 to-orange-500' },
  { name: 'Slate Gray', color: '#8b949e', gradient: 'from-gray-600 to-slate-700' },
  { name: 'Indigo Dream', color: '#6366f1', gradient: 'from-indigo-600 to-purple-700' },
  { name: 'Mint Fresh', color: '#34d399', gradient: 'from-teal-400 to-cyan-500' },
];

export function BoardBackgroundModal({ board, isOpen, onClose }: BoardBackgroundModalProps) {
  const [selectedColor, setSelectedColor] = useState(board.background || '#0079bf');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (background: string) => boardsApi.update(board.id, { background }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', board.id] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onClose();
    },
  });

  const handleSelectBackground = (color: string) => {
    setSelectedColor(color);
    updateMutation.mutate(color);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Change Background</h2>
              <p className="text-sm text-gray-500 mt-1">{board.title}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Choose a background</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {backgroundOptions.map((option) => (
              <button
                key={option.color}
                onClick={() => handleSelectBackground(option.color)}
                className={`relative group rounded-xl overflow-hidden transition-all duration-200 hover:scale-105 ${
                  selectedColor === option.color
                    ? 'ring-4 ring-blue-500 shadow-xl'
                    : 'hover:shadow-lg'
                }`}
              >
                <div
                  className={`h-24 bg-gradient-to-br ${option.gradient} transition-transform duration-200 group-hover:scale-110`}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                  {selectedColor === option.color && (
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2 bg-white border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-700 truncate">{option.name}</p>
                </div>
              </button>
            ))}
          </div>

          {updateMutation.isPending && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Updating background...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
