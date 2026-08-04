import api from './client';
import type { HealthResponse } from '../types/api';

export async function checkHealth(): Promise<HealthResponse> {
  const res = await api.get<HealthResponse>('/health');
  return res.data;
}
