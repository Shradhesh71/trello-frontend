'use client';

import { Card } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckSquare, MessageSquare, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { CardDetailsModal } from './card-details-modal';

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
      listId: card.listId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasLabels = card.labels && card.labels.length > 0;
  const hasChecklist = card.checklists && card.checklists.length > 0;
  const hasAttachments = card.attachments && card.attachments.length > 0;
  const hasComments = card.comments && card.comments.length > 0;

  const completedItems = card.checklists?.reduce((acc, checklist) => {
    return acc + (checklist.items?.filter(item => item.isCompleted).length || 0);
  }, 0) || 0;

  const totalItems = card.checklists?.reduce((acc, checklist) => {
    return acc + (checklist.items?.length || 0);
  }, 0) || 0;

  const isDueSoon = card.dueDate && new Date(card.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          if (!isDragging) {
            setIsModalOpen(true);
          }
        }}
        className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200 hover:-translate-y-0.5"
      >
        {card.coverImage && (
          <img
            src={card.coverImage}
            alt="Card cover"
            className="w-full h-36 object-cover rounded-lg -mx-4 -mt-4 mb-3"
          />
        )}

        {hasLabels && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {card.labels?.map((label) => (
              <div
                key={label.id}
                className="h-2 rounded-full transition-all group-hover:h-6 group-hover:px-3 group-hover:flex group-hover:items-center overflow-hidden"
                style={{ 
                  backgroundColor: label.color,
                  minWidth: '40px',
                }}
                title={label.name}
              >
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {label.name}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-900 font-medium mb-3 leading-relaxed">{card.title}</p>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {card.dueDate && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                isOverdue
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : isDueSoon
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(card.dueDate), 'MMM d')}</span>
            </div>
          )}

          {hasChecklist && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              completedItems === totalItems && totalItems > 0
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{completedItems}/{totalItems}</span>
            </div>
          )}

          {card.description && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          )}

          {hasAttachments && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{card.attachments?.length}</span>
            </div>
          )}
        </div>

        {card.members && card.members.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {card.members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold"
                title={member.name}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {card.members.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold">
                +{card.members.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      <CardDetailsModal
        card={card}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
