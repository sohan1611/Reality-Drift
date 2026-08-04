import { apiFetch } from "./api";

export const getReplay = () => apiFetch('/replay');
