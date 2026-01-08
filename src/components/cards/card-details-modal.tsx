'use client';

import { Card } from '@/types';
import { X, CreditCard, AlignLeft, CheckSquare, Tag, Calendar, User, Archive, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardsApi, labelsApi, checklistsApi } from '@/lib/api';
import { format } from 'date-fns';
import { CardLabels } from './card-labels';
import { CardChecklist } from './card-checklist';
import { CardDueDate } from './card-due-date';
import { createPortal } from 'react-dom';

interface CardDetailsModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailsModal({ card: initialCard, isOpen, onClose }: CardDetailsModalProps) {
  const [title, setTitle] = useState(initialCard.title);
  const [description, setDescription] = useState(initialCard.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const queryClient = useQueryClient();

  // Fetch fresh card data
  const { data: card } = useQuery({
    queryKey: ['cards', initialCard.id],
    queryFn: () => cardsApi.getById(initialCard.id),
    initialData: initialCard,
    enabled: isOpen,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.id] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: cardsApi.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: cardsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onClose();
    },
  });

  const handleUpdateTitle = () => {
    if (title.trim() && title !== card.title) {
      updateMutation.mutate({ id: card.id, data: { title: title.trim() } });
    } else {
      setTitle(card.title);
    }
    setIsEditingTitle(false);
  };

  const handleUpdateDescription = () => {
    if (description !== card.description) {
      updateMutation.mutate({ id: card.id, data: { description: description.trim() || undefined } });
    }
    setIsEditingDescription(false);
  };

  const handleArchive = () => {
    archiveMutation.mutate(card.id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      deleteMutation.mutate(card.id);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto pt-20 pb-20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-3xl mx-4 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-gray-600 mt-1" />
            <div className="flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle();
                    if (e.key === 'Escape') {
                      setTitle(card.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="w-full px-2 py-1 text-xl font-semibold bg-white border border-blue-500 rounded focus:outline-none"
                  autoFocus
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-xl font-semibold text-gray-900 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded -ml-2"
                >
                  {card.title}
                </h2>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-700">Labels</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {card.labels.map((label) => (
                    <span
                      key={label.id}
                      className="px-3 py-1.5 rounded-lg text-white text-sm font-medium shadow-sm"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date */}
            {card.dueDate && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-700">Due Date</h3>
                </div>
                <div className="text-sm text-gray-700 font-medium bg-gray-100 px-3 py-2 rounded-lg inline-block">
                  {format(new Date(card.dueDate), 'MMM d, yyyy \'at\' h:mm a')}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlignLeft className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-bold text-gray-700">Description</h3>
              </div>
              {isEditingDescription ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleUpdateDescription}
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDescription(card.description || '');
                        setIsEditingDescription(false);
                      }}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className="px-4 py-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer min-h-[100px] border border-gray-200 transition-colors"
                >
                  {card.description || (
                    <span className="text-gray-500">Add a more detailed description...</span>
                  )}
                </div>
              )}
            </div>

            {/* Checklists */}
            {card.checklists && card.checklists.length > 0 && (
              <div className="space-y-4">
                {card.checklists.map((checklist) => (
                  <CardChecklist key={checklist.id} checklist={checklist} cardId={card.id} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="w-48 flex-shrink-0 space-y-2">
            <div className="text-xs font-bold text-gray-600 mb-3">ADD TO CARD</div>
            
            <CardLabels cardId={card.id} />
            <CardChecklist cardId={card.id} />
            <CardDueDate cardId={card.id} currentDueDate={card.dueDate} />

            <div className="text-xs font-bold text-gray-600 mt-6 mb-3">ACTIONS</div>
            
            <button
              onClick={handleArchive}
              className="w-full px-3 py-2.5 text-sm text-left bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>

            <button
              onClick={handleDelete}
              className="w-full px-3 py-2.5 text-sm text-left bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
