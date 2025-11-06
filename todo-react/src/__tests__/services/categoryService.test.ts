import { describe, it, expect, beforeEach, vi } from 'vitest';
import { categoryService } from '../../services/categoryService';
import apiClient from '../../services/api';
import { Category, CategoryCreateDto } from '../../types';

vi.mock('../../services/api');

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCategory: Category = {
    id: 1,
    name: 'Work',
    description: 'Work-related tasks',
    color: '#3B82F6',
    userId: 1,
  };

  describe('getAll', () => {
    it('should fetch all categories', async () => {
      const mockCategories: Category[] = [
        mockCategory,
        {
          id: 2,
          name: 'Personal',
          description: 'Personal tasks',
          color: '#10B981',
          userId: 1,
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockCategories,
      } as any);

      const result = await categoryService.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/api/category');
      expect(result).toEqual(mockCategories);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no categories', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: [],
      } as any);

      const result = await categoryService.getAll();

      expect(result).toEqual([]);
    });

    it('should handle error when fetching categories', async () => {
      const mockError = new Error('Failed to fetch categories');
      vi.mocked(apiClient.get).mockRejectedValueOnce(mockError);

      await expect(categoryService.getAll()).rejects.toThrow('Failed to fetch categories');
    });
  });

  describe('getById', () => {
    it('should fetch a category by id', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockCategory,
      } as any);

      const result = await categoryService.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/api/category/1');
      expect(result).toEqual(mockCategory);
    });

    it('should handle error when category not found', async () => {
      const mockError = new Error('Category not found');
      vi.mocked(apiClient.get).mockRejectedValueOnce(mockError);

      await expect(categoryService.getById(999)).rejects.toThrow('Category not found');
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const newCategory: CategoryCreateDto = {
        name: 'Shopping',
        description: 'Shopping list',
        color: '#F59E0B',
      };

      const createdCategory: Category = {
        id: 3,
        ...newCategory,
        userId: 1,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: createdCategory,
      } as any);

      const result = await categoryService.create(newCategory);

      expect(apiClient.post).toHaveBeenCalledWith('/api/category', newCategory);
      expect(result).toEqual(createdCategory);
      expect(result.id).toBe(3);
      expect(result.name).toBe('Shopping');
    });

    it('should handle error when creating category with duplicate name', async () => {
      const duplicateCategory: CategoryCreateDto = {
        name: 'Work',
        description: 'Duplicate',
        color: '#000000',
      };

      const mockError = new Error('Category name already exists');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(categoryService.create(duplicateCategory)).rejects.toThrow(
        'Category name already exists'
      );
    });

    it('should create category without description', async () => {
      const minimalCategory: CategoryCreateDto = {
        name: 'Minimal',
        color: '#6B7280',
      };

      const createdCategory: Category = {
        id: 4,
        name: 'Minimal',
        color: '#6B7280',
        userId: 1,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: createdCategory,
      } as any);

      const result = await categoryService.create(minimalCategory);

      expect(result).toEqual(createdCategory);
      expect(result.description).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      const updateDto: CategoryCreateDto = {
        name: 'Work Updated',
        description: 'Updated description',
        color: '#EF4444',
      };

      const updatedCategory: Category = {
        id: 1,
        ...updateDto,
        userId: 1,
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: updatedCategory,
      } as any);

      const result = await categoryService.update(1, updateDto);

      expect(apiClient.put).toHaveBeenCalledWith('/api/category/1', updateDto);
      expect(result).toEqual(updatedCategory);
      expect(result.name).toBe('Work Updated');
    });

    it('should handle error when updating non-existent category', async () => {
      const updateDto: CategoryCreateDto = {
        name: 'Non-existent',
        color: '#000000',
      };

      const mockError = new Error('Category not found');
      vi.mocked(apiClient.put).mockRejectedValueOnce(mockError);

      await expect(categoryService.update(999, updateDto)).rejects.toThrow('Category not found');
    });

    it('should update category color only', async () => {
      const updateDto: CategoryCreateDto = {
        name: 'Work',
        description: 'Work-related tasks',
        color: '#8B5CF6', // Only color changed
      };

      const updatedCategory: Category = {
        id: 1,
        ...updateDto,
        userId: 1,
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: updatedCategory,
      } as any);

      const result = await categoryService.update(1, updateDto);

      expect(result.color).toBe('#8B5CF6');
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({} as any);

      await categoryService.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/api/category/1');
    });

    it('should handle error when deleting non-existent category', async () => {
      const mockError = new Error('Category not found');
      vi.mocked(apiClient.delete).mockRejectedValueOnce(mockError);

      await expect(categoryService.delete(999)).rejects.toThrow('Category not found');
    });

    it('should handle error when deleting category with associated todos', async () => {
      const mockError = new Error('Cannot delete category with associated todos');
      vi.mocked(apiClient.delete).mockRejectedValueOnce(mockError);

      await expect(categoryService.delete(1)).rejects.toThrow(
        'Cannot delete category with associated todos'
      );
    });
  });
});
