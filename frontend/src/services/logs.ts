import { apiFetch } from "./api";

export const createLog = (data: any) => apiFetch('/logs', { method: 'POST', body: JSON.stringify(data) });
export const getLogs = () => apiFetch('/logs');
export const updateLog = (id: string, data: any) => apiFetch(`/logs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteLog = (id: string) => apiFetch(`/logs/${id}`, { method: 'DELETE' });
export const getNotifications = () => apiFetch('/notifications');
export const searchLogs = (query: string) => apiFetch(`/search?q=${encodeURIComponent(query)}`);
