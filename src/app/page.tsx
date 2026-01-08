'use client';

import { useQuery } from '@tanstack/react-query';
import { boardsApi } from '@/lib/api';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CreateBoardModal } from '@/components/boards/create-board-modal';

export default function HomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: boards, isLoading, error } = useQuery({
    queryKey: ['boards'],
    queryFn: () => boardsApi.getAll(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading boards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Error loading boards. Please check if backend is running.</div>
      </div>
    );
  }

  // Ensure boards is an array
  const boardList = Array.isArray(boards) ? boards : [];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Boards</h1>
            <p className="text-blue-100">Manage your projects with boards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boardList.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 rounded-xl p-8 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <h3 className="text-xl font-bold relative z-10">{board.title}</h3>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mb-16 group-hover:scale-150 transition-transform duration-500" />
              </Link>
            ))}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-xl p-8 text-white border-2 border-dashed border-white/30 hover:border-white/60 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
            >
              <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Create new board</span>
            </button>
          </div>
        </div>
      </div>

      <CreateBoardModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
}


