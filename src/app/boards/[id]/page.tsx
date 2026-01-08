'use client';

import { useQuery } from '@tanstack/react-query';
import { boardsApi } from '@/lib/api';
import { BoardHeader } from '@/components/boards/board-header';
import { BoardContent } from '@/components/boards/board-content';
import { useParams } from 'next/navigation';
import { getBoardGradient } from '@/lib/board-backgrounds';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const { data: board, isLoading, error } = useQuery({
    queryKey: ['boards', boardId],
    queryFn: () => boardsApi.getById(boardId),
    enabled: !!boardId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white">
          <div className="text-xl mb-2">Error loading board</div>
          <div className="text-sm opacity-75">{(error as Error).message}</div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Board not found</div>
      </div>
    );
  }

  const gradientClasses = getBoardGradient(board.background);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientClasses}`}>
      <BoardHeader board={board} />
      <BoardContent board={board} />
    </div>
  );
}
