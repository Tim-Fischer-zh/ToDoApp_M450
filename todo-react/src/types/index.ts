// Enums
export enum TodoPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3,
}

// User & Auth Types
export interface User {
  userId: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  userId: number;
}

export interface CategoryCreateDto {
  name: string;
  description?: string;
  color: string;
}

// Tag Types
export interface Tag {
  id: number;
  name: string;
  color: string;
  userId: number;
}

export interface TagCreateDto {
  name: string;
  color: string;
}

// Todo Types
export interface TodoItem {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: TodoPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  categoryId?: number;
  category?: Category;
  tags: Tag[];
  userId: number;
}

export interface TodoCreateDto {
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: TodoPriority;
  dueDate?: string;
  categoryId?: number;
  tagIds: number[];
}

export interface TodoUpdateDto extends TodoCreateDto {}

// Pagination & Filter Types
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TodoFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  isCompleted?: boolean;
  categoryId?: number;
  tagId?: number;
  priority?: TodoPriority;
  dueBefore?: string;
  dueAfter?: string;
  searchTerm?: string;
}
