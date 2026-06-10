import { apiFetch } from "./api";

export const getNotifications = () => apiFetch('/notifications');
export const markNotificationRead = (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
export const markAllNotificationsRead = () => apiFetch('/notifications/read-all', { method: 'PATCH' });
