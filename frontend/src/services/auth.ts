import { apiFetch } from "./api";

export const signup = (data: any) => apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
export const login = (data: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) });
