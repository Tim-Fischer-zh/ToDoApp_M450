import apiClient from './api';
import { Tag, TagCreateDto } from '../types';

export const tagService = {
  async getAll(): Promise<Tag[]> {
    const response = await apiClient.get<Tag[]>('/api/tag');
    return response.data;
  },

  async getById(id: number): Promise<Tag> {
    const response = await apiClient.get<Tag>(`/api/tag/${id}`);
    return response.data;
  },

  async create(tag: TagCreateDto): Promise<Tag> {
    const response = await apiClient.post<Tag>('/api/tag', tag);
    return response.data;
  },

  async update(id: number, tag: TagCreateDto): Promise<Tag> {
    const response = await apiClient.put<Tag>(`/api/tag/${id}`, tag);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/tag/${id}`);
  },
};
