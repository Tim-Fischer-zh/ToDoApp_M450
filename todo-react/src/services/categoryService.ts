import apiClient from './api';
import { Category, CategoryCreateDto } from '../types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/api/category');
    return response.data;
  },

  async getById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/api/category/${id}`);
    return response.data;
  },

  async create(category: CategoryCreateDto): Promise<Category> {
    const response = await apiClient.post<Category>('/api/category', category);
    return response.data;
  },

  async update(id: number, category: CategoryCreateDto): Promise<Category> {
    const response = await apiClient.put<Category>(`/api/category/${id}`, category);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/category/${id}`);
  },
};
