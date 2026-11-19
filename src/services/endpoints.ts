import { api } from './api';
import type { AuthResponse, Category, Filters, Page, Priority, Status, Summary, Task, TaskInput, User } from '../types';
export const endpoints = {
  register: async (body:{displayName:string;email:string;password:string}) => (await api.post<AuthResponse>('/auth/register',body)).data,
  login: async (body:{email:string;password:string}) => (await api.post<AuthResponse>('/auth/login',body)).data,
  logout: async (refreshToken:string) => api.post('/auth/logout',{refreshToken}),
  me: async () => (await api.get<User>('/users/me')).data,
  categories: async () => (await api.get<Category[]>('/categories')).data,
  addCategory: async (name:string) => (await api.post<Category>('/categories',{name})).data,
  renameCategory: async (id:string,name:string) => (await api.put<Category>(`/categories/${id}`,{name})).data,
  deleteCategory: async (id:string) => api.delete(`/categories/${id}`),
  summary: async () => (await api.get<Summary>('/dashboard/summary')).data,
  tasks: async (filters:Filters) => (await api.get<Page<Task>>('/tasks',{params:{...filters,status:filters.status||undefined,priority:filters.priority||undefined,categoryId:filters.categoryId||undefined,search:filters.search||undefined}})).data,
  getTask: async (id:string) => (await api.get<Task>(`/tasks/${id}`)).data,
  addTask: async (body:TaskInput) => (await api.post<Task>('/tasks',body)).data,
  updateTask: async (task:Task,body:TaskInput) => (await api.put<Task>(`/tasks/${task.id}`,{...body,version:task.version})).data,
  status: async (id:string,status:Status) => (await api.patch<Task>(`/tasks/${id}/status`,{status})).data,
  deleteTask: async (id:string) => api.delete(`/tasks/${id}`),
};
export const statuses:Status[]=['TODO','IN_PROGRESS','COMPLETED','CANCELLED'];
export const priorities:Priority[]=['LOW','MEDIUM','HIGH','CRITICAL'];
export const statusLabels:Record<Status,string>={TODO:'To do',IN_PROGRESS:'In progress',COMPLETED:'Completed',CANCELLED:'Cancelled'};
export const priorityLabels:Record<Priority,string>={LOW:'Low',MEDIUM:'Medium',HIGH:'High',CRITICAL:'Critical'};
export const transitions:Record<Status,Status[]>={TODO:['IN_PROGRESS','COMPLETED','CANCELLED'],IN_PROGRESS:['TODO','COMPLETED','CANCELLED'],COMPLETED:['TODO'],CANCELLED:['TODO']};
