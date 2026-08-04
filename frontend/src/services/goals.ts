import { apiFetch } from "./api";

export const getGoals = () => apiFetch('/goals');
export const createGoal = (data: any) => apiFetch('/goals', { method: 'POST', body: JSON.stringify(data) });
export const deleteGoal = (id: string) => apiFetch(`/goals/${id}`, { method: 'DELETE' });
