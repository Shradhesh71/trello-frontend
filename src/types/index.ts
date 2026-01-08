export interface Board {
  id: string;
  title: string;
  background?: string;
  createdAt: string;
  updatedAt: string;
  lists?: List[];
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  cards?: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  listId: string;
  dueDate?: string;
  isArchived: boolean;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  labels?: Label[];
  members?: Member[];
  checklists?: Checklist[];
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Checklist {
  id: string;
  title: string;
  cardId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  position: number;
  checklistId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  cardId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  memberId: string;
  member?: Member;
  createdAt: string;
  updatedAt: string;
}

// API request types
export interface CreateBoardDto {
  title: string;
  background?: string;
}

export interface UpdateBoardDto {
  title?: string;
  background?: string;
}

export interface CreateListDto {
  title: string;
  boardId: string;
  position?: number;
}

export interface UpdateListDto {
  title?: string;
}

export interface UpdateListPositionDto {
  position: number;
}

export interface CreateCardDto {
  title: string;
  listId: string;
  position?: number;
  description?: string;
}

export interface UpdateCardDto {
  title?: string;
  description?: string;
  dueDate?: string;
  coverImage?: string;
}

export interface MoveCardDto {
  listId: string;
  position: number;
}

export interface UpdateCardPositionDto {
  position: number;
}

export interface CreateLabelDto {
  name: string;
  color: string;
}

export interface UpdateLabelDto {
  name?: string;
  color?: string;
}

export interface AssignLabelDto {
  cardId: string;
  labelId: string;
}

export interface CreateChecklistDto {
  title: string;
  cardId: string;
  position?: number;
}

export interface UpdateChecklistDto {
  title?: string;
}

export interface CreateChecklistItemDto {
  title: string;
  checklistId: string;
  position?: number;
}

export interface UpdateChecklistItemDto {
  title?: string;
  isCompleted?: boolean;
}

export interface SearchParams {
  query?: string;
  boardId?: string;
  listId?: string;
  labelIds?: string[];
  memberIds?: string[];
  isArchived?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  hasChecklist?: boolean;
  sortBy?: 'title' | 'dueDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
