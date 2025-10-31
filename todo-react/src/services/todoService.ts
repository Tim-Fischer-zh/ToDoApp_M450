import apiClient from './api';
import { TodoItem, TodoCreateDto, TodoUpdateDto, PaginatedResponse, TodoFilters } from '../types';

export const todoService = {
  async getAll(filters?: TodoFilters): Promise<PaginatedResponse<TodoItem>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<TodoItem>>(
      `/api/todo?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: number): Promise<TodoItem> {
    const response = await apiClient.get<TodoItem>(`/api/todo/${id}`);
    return response.data;
  },

  async create(todo: TodoCreateDto): Promise<TodoItem> {
    const response = await apiClient.post<TodoItem>('/api/todo', todo);
    return response.data;
  },

  async update(id: number, todo: TodoUpdateDto): Promise<TodoItem> {
    const response = await apiClient.put<TodoItem>(`/api/todo/${id}`, todo);
    return response.data;
  },

  async toggle(id: number): Promise<void> {
    await apiClient.patch(`/api/todo/${id}/toggle`);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/todo/${id}`);
  },

  async search(searchTerm: string): Promise<TodoItem[]> {
    const response = await apiClient.get<TodoItem[]>(`/api/todo/search?searchTerm=${searchTerm}`);
    return response.data;
  },
};
