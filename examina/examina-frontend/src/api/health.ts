// src/api/health.ts
import api from "./axios";
import type { HealthResponse } from "../types/api";

export const checkHealth = async (): Promise<HealthResponse> => {
  const res = await api.get<HealthResponse>("/health");
  return res.data;
};