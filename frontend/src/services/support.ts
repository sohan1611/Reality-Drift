import { apiFetch } from './api';

export const submitIssueReport = async (data: { type: string; title: string; description: string; stepsToReproduce?: string; screenshotUrl?: string }) => {
  return await apiFetch('/support/issue', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const submitFeatureRequest = async (data: { category: string; title: string; description: string }) => {
  return await apiFetch('/support/feature', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
