'use client';

import { Board } from '@/types';
import { ArrowLeft, Search, Share2, Palette } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { SearchModal } from '@/components/search/search-modal';
import { ShareBoardModal } from './share-board-modal';
import { BoardBackgroundModal } from './board-background-modal';

interface BoardHeaderProps {
  board: Board;
}

export function BoardHeader({ board }: BoardHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);

  return (
    <>
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 shadow-xl">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-white hover:bg-white/10 p-2.5 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">{board.title}</h1>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBackgroundOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 font-medium shadow-lg"
              title="Change background"
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm">Background</span>
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 font-medium shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 font-medium shadow-lg"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search cards</span>
            </button>
          </div>
        </div>
      </header>

      <SearchModal
        boardId={board.id}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <ShareBoardModal
        board={board}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <BoardBackgroundModal
        board={board}
        isOpen={isBackgroundOpen}
        onClose={() => setIsBackgroundOpen(false)}
      />
    </>
  );
}
