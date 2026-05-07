import { apiFetch } from "./api";

export const getProjects = () => apiFetch('/projects');
export const createProject = (data: any) => apiFetch('/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id: string, data: any) => apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id: string) => apiFetch(`/projects/${id}`, { method: 'DELETE' });

// Tasks
export const addTask = (projectId: string, title: string) =>
  apiFetch(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify({ title }) });
export const toggleTask = (projectId: string, taskId: string) =>
  apiFetch(`/projects/${projectId}/tasks/${taskId}/toggle`, { method: 'PUT' });
export const deleteTask = (projectId: string, taskId: string) =>
  apiFetch(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
