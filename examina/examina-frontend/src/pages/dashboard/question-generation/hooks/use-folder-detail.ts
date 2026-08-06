import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSubjectStore } from "../subject-store";
import type { SubjectFolder } from "@/shared/types/domain";

export function getFolderHref(subjectId: string, folderId: string) {
    return `/dashboard/questions-generation/${subjectId}/folders/${folderId}`;
}

export function useFolderDetail(folders: SubjectFolder[], foldersLoading: boolean) {
  const { subjectId, folderId } = useParams<{ subjectId: string; folderId: string }>();
  const navigate = useNavigate();
  const subjects = useSubjectStore((s) => s.subjects);
  const storeLoading = useSubjectStore((s) => s.loading);
  const fetchSubjects = useSubjectStore((s) => s.fetchSubjects);
  const prevTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (subjects.length === 0) {
      void fetchSubjects();
    }
  }, [subjects.length, fetchSubjects]);

  const subject = subjects.find((s) => s.subject_id === subjectId);
  const subjectName = subject?.subject_name;
  const isSubjectHydrating = storeLoading || (subjects.length === 0 && Boolean(subjectId));
  const selectedFolder = folderId ? folders.find((f) => f.folder_id === folderId) : undefined;

  useEffect(() => {
    if (folderId && !foldersLoading && folders.length > 0 && !selectedFolder) {
      navigate(`/dashboard/questions-generation/${subjectId ?? ""}`, {
    replace: true,
    });
    }
  }, [folderId, foldersLoading, folders.length, selectedFolder, subjectId, navigate]);

  useEffect(() => {
    if (!folderId || !selectedFolder) return;
    if (prevTitleRef.current === null) {
      prevTitleRef.current = document.title;
    }
    const subjectLabel = subjectName ?? subjectId ?? "Subject";
    document.title = `${selectedFolder.folder_name} · ${subjectLabel} · Examina`;

    return () => {
      if (prevTitleRef.current !== null) {
        document.title = prevTitleRef.current;
        prevTitleRef.current = null;
      }
    };
  }, [folderId, selectedFolder, subjectName, subjectId]);

  useEffect(() => {
    if (folderId) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [folderId]);

  return {
    subjectId,
    folderId,
    subjectName,
    isSubjectHydrating,
    selectedFolder,
  };
}
