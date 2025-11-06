import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tagService } from '../../services/tagService';
import apiClient from '../../services/api';
import { Tag, TagCreateDto } from '../../types';

vi.mock('../../services/api');

describe('tagService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTag: Tag = {
    id: 1,
    name: 'Important',
    color: '#EF4444',
    userId: 1,
  };

  describe('getAll', () => {
    it('should fetch all tags', async () => {
      const mockTags: Tag[] = [
        mockTag,
        {
          id: 2,
          name: 'Urgent',
          color: '#F59E0B',
          userId: 1,
        },
        {
          id: 3,
          name: 'Optional',
          color: '#6B7280',
          userId: 1,
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockTags,
      } as any);

      const result = await tagService.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/api/tag');
      expect(result).toEqual(mockTags);
      expect(result.length).toBe(3);
    });

    it('should return empty array when no tags', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: [],
      } as any);

      const result = await tagService.getAll();

      expect(result).toEqual([]);
    });

    it('should handle error when fetching tags', async () => {
      const mockError = new Error('Failed to fetch tags');
      vi.mocked(apiClient.get).mockRejectedValueOnce(mockError);

      await expect(tagService.getAll()).rejects.toThrow('Failed to fetch tags');
    });
  });

  describe('getById', () => {
    it('should fetch a tag by id', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockTag,
      } as any);

      const result = await tagService.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/api/tag/1');
      expect(result).toEqual(mockTag);
    });

    it('should handle error when tag not found', async () => {
      const mockError = new Error('Tag not found');
      vi.mocked(apiClient.get).mockRejectedValueOnce(mockError);

      await expect(tagService.getById(999)).rejects.toThrow('Tag not found');
    });
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const newTag: TagCreateDto = {
        name: 'Meeting',
        color: '#3B82F6',
      };

      const createdTag: Tag = {
        id: 4,
        ...newTag,
        userId: 1,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: createdTag,
      } as any);

      const result = await tagService.create(newTag);

      expect(apiClient.post).toHaveBeenCalledWith('/api/tag', newTag);
      expect(result).toEqual(createdTag);
      expect(result.id).toBe(4);
      expect(result.name).toBe('Meeting');
    });

    it('should handle error when creating tag with duplicate name', async () => {
      const duplicateTag: TagCreateDto = {
        name: 'Important',
        color: '#000000',
      };

      const mockError = new Error('Tag name already exists');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(tagService.create(duplicateTag)).rejects.toThrow('Tag name already exists');
    });

    it('should create tag with different colors', async () => {
      const colorVariations = [
        { name: 'Red Tag', color: '#EF4444' },
        { name: 'Blue Tag', color: '#3B82F6' },
        { name: 'Green Tag', color: '#10B981' },
      ];

      for (const variation of colorVariations) {
        const createdTag: Tag = {
          id: Math.random(),
          ...variation,
          userId: 1,
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({
          data: createdTag,
        } as any);

        const result = await tagService.create(variation);

        expect(result.color).toBe(variation.color);
      }
    });
  });

  describe('update', () => {
    it('should update an existing tag', async () => {
      const updateDto: TagCreateDto = {
        name: 'Very Important',
        color: '#DC2626',
      };

      const updatedTag: Tag = {
        id: 1,
        ...updateDto,
        userId: 1,
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: updatedTag,
      } as any);

      const result = await tagService.update(1, updateDto);

      expect(apiClient.put).toHaveBeenCalledWith('/api/tag/1', updateDto);
      expect(result).toEqual(updatedTag);
      expect(result.name).toBe('Very Important');
    });

    it('should handle error when updating non-existent tag', async () => {
      const updateDto: TagCreateDto = {
        name: 'Non-existent',
        color: '#000000',
      };

      const mockError = new Error('Tag not found');
      vi.mocked(apiClient.put).mockRejectedValueOnce(mockError);

      await expect(tagService.update(999, updateDto)).rejects.toThrow('Tag not found');
    });

    it('should update tag name only', async () => {
      const updateDto: TagCreateDto = {
        name: 'Critical',
        color: '#EF4444', // Same color
      };

      const updatedTag: Tag = {
        id: 1,
        ...updateDto,
        userId: 1,
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: updatedTag,
      } as any);

      const result = await tagService.update(1, updateDto);

      expect(result.name).toBe('Critical');
      expect(result.color).toBe('#EF4444');
    });

    it('should update tag color only', async () => {
      const updateDto: TagCreateDto = {
        name: 'Important',
        color: '#8B5CF6', // Only color changed
      };

      const updatedTag: Tag = {
        id: 1,
        ...updateDto,
        userId: 1,
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: updatedTag,
      } as any);

      const result = await tagService.update(1, updateDto);

      expect(result.name).toBe('Important');
      expect(result.color).toBe('#8B5CF6');
    });
  });

  describe('delete', () => {
    it('should delete a tag', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({} as any);

      await tagService.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/api/tag/1');
    });

    it('should handle error when deleting non-existent tag', async () => {
      const mockError = new Error('Tag not found');
      vi.mocked(apiClient.delete).mockRejectedValueOnce(mockError);

      await expect(tagService.delete(999)).rejects.toThrow('Tag not found');
    });

    it('should handle error when deleting tag associated with todos', async () => {
      const mockError = new Error('Cannot delete tag that is assigned to todos');
      vi.mocked(apiClient.delete).mockRejectedValueOnce(mockError);

      await expect(tagService.delete(1)).rejects.toThrow(
        'Cannot delete tag that is assigned to todos'
      );
    });

    it('should allow deleting multiple tags sequentially', async () => {
      const tagIds = [1, 2, 3];

      vi.mocked(apiClient.delete)
        .mockResolvedValueOnce({} as any)
        .mockResolvedValueOnce({} as any)
        .mockResolvedValueOnce({} as any);

      for (const id of tagIds) {
        await tagService.delete(id);
      }

      expect(apiClient.delete).toHaveBeenCalledTimes(3);
      expect(apiClient.delete).toHaveBeenNthCalledWith(1, '/api/tag/1');
      expect(apiClient.delete).toHaveBeenNthCalledWith(2, '/api/tag/2');
      expect(apiClient.delete).toHaveBeenNthCalledWith(3, '/api/tag/3');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete tag lifecycle', async () => {
      // Create
      const newTag: TagCreateDto = { name: 'Project', color: '#8B5CF6' };
      const createdTag: Tag = { id: 10, ...newTag, userId: 1 };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: createdTag } as any);
      const created = await tagService.create(newTag);
      expect(created.id).toBe(10);

      // Get by ID
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: createdTag } as any);
      const fetched = await tagService.getById(10);
      expect(fetched.name).toBe('Project');

      // Update
      const updateDto: TagCreateDto = { name: 'Project Updated', color: '#8B5CF6' };
      const updatedTag: Tag = { id: 10, ...updateDto, userId: 1 };

      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: updatedTag } as any);
      const updated = await tagService.update(10, updateDto);
      expect(updated.name).toBe('Project Updated');

      // Delete
      vi.mocked(apiClient.delete).mockResolvedValueOnce({} as any);
      await tagService.delete(10);
      expect(apiClient.delete).toHaveBeenCalledWith('/api/tag/10');
    });
  });
});
