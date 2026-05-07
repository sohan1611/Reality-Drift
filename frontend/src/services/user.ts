import { apiFetch } from "./api";

export const getMe = () => apiFetch('/user/me');
export const updatePassword = (data: any) => apiFetch('/user/password', { method: 'PUT', body: JSON.stringify(data) });
