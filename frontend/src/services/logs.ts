import { apiFetch } from "./api";

export const createLog = (data: any) => apiFetch('/log', { method: 'POST', body: JSON.stringify(data) });
export const getLogs = () => apiFetch('/logs');
export const updateLog = (id: string, data: any) => apiFetch(`/log/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLog = (id: string) => apiFetch(`/log/${id}`, { method: 'DELETE' });
export const getNotifications = () => apiFetch('/notifications');
export const searchLogs = (query: string) => apiFetch(`/search?q=${encodeURIComponent(query)}`);
