import type {
  Board,
  List,
  Card,
  Label,
  Checklist,
  ChecklistItem,
  CreateBoardDto,
  UpdateBoardDto,
  CreateListDto,
  UpdateListDto,
  UpdateListPositionDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  UpdateCardPositionDto,
  CreateLabelDto,
  UpdateLabelDto,
  AssignLabelDto,
  CreateChecklistDto,
  UpdateChecklistDto,
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
  SearchParams,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Transform backend response to flatten nested card structures
function transformCard(card: any): Card {
  return {
    ...card,
    labels: card.cardLabels?.map((cl: any) => cl.label) || [],
    members: card.cardMembers?.map((cm: any) => cm.user) || [],
    cardLabels: undefined,
    cardMembers: undefined,
  };
}

function transformBoard(board: any): Board {
  if (!board) return board;
  
  return {
    ...board,
    lists: board.lists?.map((list: any) => ({
      ...list,
      cards: list.cards?.map(transformCard) || [],
    })) || [],
  };
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();
    
    // Handle cases where API wraps response in { success: true, data: ... }
    if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
      // Check for {success: true, data: ...} pattern (primary pattern from your backend)
      if ('success' in jsonData && 'data' in jsonData) {
        return jsonData.data as T;
      }
      // Check for direct {data: ...} pattern
      if ('data' in jsonData && Object.keys(jsonData).length === 1) {
        return jsonData.data as T;
      }
      // Check common wrapper properties for specific endpoints
      if ('boards' in jsonData && endpoint.includes('/boards')) return jsonData.boards as T;
      if ('lists' in jsonData && endpoint.includes('/lists')) return jsonData.lists as T;
      if ('cards' in jsonData && endpoint.includes('/cards')) return jsonData.cards as T;
      if ('labels' in jsonData && endpoint.includes('/labels')) return jsonData.labels as T;
      if ('checklists' in jsonData && endpoint.includes('/checklists')) return jsonData.checklists as T;
    }
    
    return jsonData as T;
  } catch (error) {
    console.error('API Error:', endpoint, error);
    throw error;
  }
}

// Board APIs
export const boardsApi = {
  getAll: () => fetchApi<Board[]>('/api/boards'),
  getById: async (id: string) => {
    const board = await fetchApi<any>(`/api/boards/${id}`);
    return transformBoard(board) as Board;
  },
  create: (data: CreateBoardDto) =>
    fetchApi<Board>('/api/boards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateBoardDto) =>
    fetchApi<Board>(`/api/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/api/boards/${id}`, {
      method: 'DELETE',
    }),
};

// List APIs
export const listsApi = {
  getAll: (boardId?: string) => {
    const params = boardId ? `?boardId=${boardId}` : '';
    return fetchApi<List[]>(`/api/lists${params}`);
  },
  getById: (id: string) => fetchApi<List>(`/api/lists/${id}`),
  create: (data: CreateListDto) =>
    fetchApi<List>('/api/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateListDto) =>
    fetchApi<List>(`/api/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updatePosition: (id: string, data: UpdateListPositionDto) =>
    fetchApi<List>(`/api/lists/${id}/position`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/api/lists/${id}`, {
      method: 'DELETE',
    }),
};

// Card APIs
export const cardsApi = {
  getAll: (listId?: string, includeArchived?: boolean) => {
    const params = new URLSearchParams();
    if (listId) params.append('listId', listId.toString());
    if (includeArchived !== undefined) params.append('includeArchived', includeArchived.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Card[]>(`/api/cards${query}`);
  },
  getById: async (id: string) => {
    const card = await fetchApi<any>(`/api/cards/${id}`);
    return transformCard(card) as Card;
  },
  create: (data: CreateCardDto) =>
    fetchApi<Card>('/api/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateCardDto) =>
    fetchApi<Card>(`/api/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updatePosition: (id: string, data: UpdateCardPositionDto) =>
    fetchApi<Card>(`/api/cards/${id}/position`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  move: (id: string, data: MoveCardDto) =>
    fetchApi<Card>(`/api/cards/${id}/move`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  archive: (id: string) =>
    fetchApi<Card>(`/api/cards/${id}/archive`, {
      method: 'PUT',
    }),
  unarchive: (id: string) =>
    fetchApi<Card>(`/api/cards/${id}/unarchive`, {
      method: 'PUT',
    }),
  delete: (id: string) =>
    fetchApi<void>(`/api/cards/${id}`, {
      method: 'DELETE',
    }),
};

// Label APIs
export const labelsApi = {
  getAll: () => fetchApi<Label[]>('/api/labels'),
  getById: (id: string) => fetchApi<Label>(`/api/labels/${id}`),
  getByCardId: (cardId: string) => fetchApi<Label[]>(`/api/labels/card/${cardId}`),
  create: (data: CreateLabelDto) =>
    fetchApi<Label>('/api/labels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateLabelDto) =>
    fetchApi<Label>(`/api/labels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/api/labels/${id}`, {
      method: 'DELETE',
    }),
  assign: (data: AssignLabelDto) =>
    fetchApi<void>('/api/labels/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  remove: (cardId: string, labelId: string) =>
    fetchApi<void>(`/api/labels/${cardId}/${labelId}`, {
      method: 'DELETE',
    }),
};

// Checklist APIs
export const checklistsApi = {
  getAll: (cardId?: string) => {
    const params = cardId ? `?cardId=${cardId}` : '';
    return fetchApi<Checklist[]>(`/api/checklists${params}`);
  },
  getById: (id: string) => fetchApi<Checklist>(`/api/checklists/${id}`),
  getProgress: (id: string) => fetchApi<{ progress: number }>(`/api/checklists/${id}/progress`),
  create: (data: CreateChecklistDto) =>
    fetchApi<Checklist>('/api/checklists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateChecklistDto) =>
    fetchApi<Checklist>(`/api/checklists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/api/checklists/${id}`, {
      method: 'DELETE',
    }),
};

// Checklist Item APIs
export const checklistItemsApi = {
  getAll: (checklistId: string) => fetchApi<ChecklistItem[]>(`/api/checklists/${checklistId}/items`),
  getById: (id: string) => fetchApi<ChecklistItem>(`/api/checklists/items/${id}`),
  create: (data: CreateChecklistItemDto) =>
    fetchApi<ChecklistItem>('/api/checklists/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateChecklistItemDto) =>
    fetchApi<ChecklistItem>(`/api/checklists/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggle: (id: string) =>
    fetchApi<ChecklistItem>(`/api/checklists/items/${id}/toggle`, {
      method: 'PUT',
    }),
  delete: (id: string) =>
    fetchApi<void>(`/api/checklists/items/${id}`, {
      method: 'DELETE',
    }),
};

// Search API
export const searchApi = {
  searchCards: async (params: SearchParams) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(`${key}[]`, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const result = await fetchApi<any>(`/api/search${query}`);
    
    // Transform cards to flatten nested structures
    if (result.cards) {
      result.cards = result.cards.map(transformCard);
    }
    
    return result;
  },
};
