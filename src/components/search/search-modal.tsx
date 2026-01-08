'use client';

import { useState } from 'react';
import { X, Search, Tag, Calendar, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchApi, labelsApi } from '@/lib/api';
import { Card, SearchParams } from '@/types';
import { CardItem } from '@/components/cards/card-item';

interface SearchModalProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ boardId, isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'overdue' | 'due-soon'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: labels } = useQuery({
    queryKey: ['labels'],
    queryFn: () => labelsApi.getAll(),
    enabled: isOpen,
  });

  const searchParams: SearchParams = {
    query: query || undefined,
    boardId,
    labelIds: selectedLabelIds.length > 0 ? selectedLabelIds : undefined,
  };

  if (dueDateFilter === 'overdue') {
    searchParams.dueDateTo = new Date().toISOString();
  } else if (dueDateFilter === 'due-soon') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    searchParams.dueDateTo = tomorrow.toISOString();
  }

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchParams],
    queryFn: () => searchApi.searchCards(searchParams),
    enabled: isOpen && (!!query || selectedLabelIds.length > 0 || dueDateFilter !== 'all'),
  });

  const cards = searchResults?.cards || [];
  const total = searchResults?.total || 0;

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedLabelIds([]);
    setDueDateFilter('all');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto pt-12 pb-12"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-3xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards..."
            className="flex-1 text-lg focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded hover:bg-gray-100 ${
              showFilters ? 'bg-gray-100' : ''
            }`}
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-4">
            {/* Labels Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">Filter by Labels</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {labels?.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    className={`px-3 py-1 rounded text-white text-sm font-medium ${
                      selectedLabelIds.includes(label.id)
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : ''
                    }`}
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">Filter by Due Date</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDueDateFilter('all')}
                  className={`px-3 py-1.5 text-sm rounded ${
                    dueDateFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDueDateFilter('overdue')}
                  className={`px-3 py-1.5 text-sm rounded ${
                    dueDateFilter === 'overdue'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Overdue
                </button>
                <button
                  onClick={() => setDueDateFilter('due-soon')}
                  className={`px-3 py-1.5 text-sm rounded ${
                    dueDateFilter === 'due-soon'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Due Soon
                </button>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Results */}
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          ) : cards.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-3">
                Found {total} card{total !== 1 ? 's' : ''}
              </div>
              {cards.map((card: Card) => (
                <div key={card.id} onClick={onClose}>
                  <CardItem card={card} />
                </div>
              ))}
            </div>
          ) : (query || selectedLabelIds.length > 0 || dueDateFilter !== 'all') ? (
            <div className="text-center py-8 text-gray-500">
              No cards found matching your search.
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Start typing to search cards, or use filters to narrow results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
