export type Status = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface User { id:string; email:string; displayName:string; createdAt?:string }
export interface AuthResponse { accessToken:string; refreshToken:string; tokenType:string; accessTokenExpiresAt:string; user:User }
export interface Category { id:string; name:string; createdAt:string }
export interface Task { id:string; title:string; description:string|null; status:Status; priority:Priority; dueDate:string|null; completedAt:string|null; overdue:boolean; categoryId:string|null; categoryName:string|null; createdAt:string; updatedAt:string; version:number }
export interface Page<T> { content:T[]; page:number; size:number; totalElements:number; totalPages:number; first:boolean; last:boolean }
export interface Summary { total:number; pending:number; completed:number; overdue:number }
export interface TaskInput { title:string; description:string; priority:Priority; dueDate:string|null; categoryId:string|null }
export interface Filters { status:string; priority:string; categoryId:string; search:string; sortBy:string; sortDirection:'ASC'|'DESC'; page:number; size:number }
export interface ApiError { message?:string; code?:string; status?:number }
