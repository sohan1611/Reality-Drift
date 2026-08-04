import { apiFetch } from "./api";

export const getReviews = () => apiFetch('/reviews');
