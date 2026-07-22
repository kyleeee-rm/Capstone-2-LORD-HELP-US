// src/types/api.ts
export interface HealthResponse {
  status: string;
  services: {
    api: string;
    postgres: string;
    chromadb: string;
  };
}