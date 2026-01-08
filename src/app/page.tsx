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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Boards</h2>
          <p className="text-purple-200">Please wait while we fetch your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/50 rounded-xl p-8 max-w-md">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-red-200">Error loading boards. Please check if backend is running.</p>
        </div>
      </div>
    );
  }

  // Ensure boards is an array
  const boardList = Array.isArray(boards) ? boards : [];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              My Boards
            </h1>
            <p className="text-purple-200 text-lg">Organize your projects and collaborate with your team</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boardList.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="group relative bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 rounded-xl p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 group-hover:from-white/5 group-hover:to-white/10 transition-all duration-300" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                <h3 className="text-xl font-bold relative z-10 mb-2">{board.title}</h3>
                <p className="text-purple-100 text-sm relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to open
                </p>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mb-16 group-hover:scale-150 transition-transform duration-500" />
              </Link>
            ))}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 rounded-xl p-8 text-white border-2 border-dashed border-purple-400/40 hover:border-purple-400/80 flex flex-col items-center justify-center gap-3 hover:-translate-y-2 shadow-xl hover:shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span className="font-semibold text-lg">Create new board</span>
              <span className="text-sm text-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Start organizing your work
              </span>
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


