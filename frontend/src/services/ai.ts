import { apiFetch } from "./api";

export const runSimulation = () => apiFetch('/simulate', { method: 'POST', body: JSON.stringify({}) });
export const getPatterns = () => apiFetch('/patterns');
export const getCoaching = () => apiFetch('/coach', { method: 'POST', body: JSON.stringify({}) });
export const getWeeklyReport = () => apiFetch('/report', { method: 'POST', body: JSON.stringify({}) });
