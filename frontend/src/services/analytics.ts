import { apiFetch } from "./api";

export const getAnalytics = () => apiFetch('/analytics');
