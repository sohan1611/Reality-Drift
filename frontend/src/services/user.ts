import { apiFetch } from "./api";

export const getMe = () => apiFetch('/user/me');
export const updatePassword = (data: any) => apiFetch('/user/password', {
  method: 'PUT',
  body: JSON.stringify(data),
});
export const exportData = () => apiFetch('/user/export');
export const deleteAccount = () => apiFetch('/user', { method: 'DELETE' });
export const updatePreferences = (data: any) => apiFetch('/user/preferences', {
  method: 'PUT',
  body: JSON.stringify(data),
});
