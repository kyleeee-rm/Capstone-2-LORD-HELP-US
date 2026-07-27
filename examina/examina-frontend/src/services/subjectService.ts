// src/services/subjectService.ts
import api from "../api/axios";

export const getSubjects = async () => {
  const res = await api.get("/subjects");
  return res.data;
};

export const createSubject = async (name: string) => {
  const res = await api.post("/subjects", { name });
  return res.data;
};