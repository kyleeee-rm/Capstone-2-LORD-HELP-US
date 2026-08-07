import { useState } from "react";
import { Download, Eye, FileText, MoreHorizontal, Trash2, Zap } from "lucide-react";
import { useActivityStore } from "@/shared/stores";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

type QuestionStatus = "queued" | "generating" | "ready";

type GeneratedQuestion = {
  id: string;
  title: string;
  question_count: number;
  difficulty: string;
  created_at: string;
  status: QuestionStatus;
};

const STATUS_STYLES: Record<QuestionStatus, string> = {
  queued: "border-border text-muted-foreground",
  generating: "border-secondary/30 bg-secondary/10 text-secondary animate-pulse",
  ready: "border-secondary/20 bg-secondary/10 text-secondary font-medium",
};

export function GeneratedQuestions() {
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([
    {
      id: "q1",
      title: "Multiple Choice - Chapter 1",
      question_count: 20,
      difficulty: "Medium",
      created_at: "July 31, 2026",
      status: "ready",
    },
    {
      id: "q2",
      title: "Identification - Chapter 2",
      question_count: 15,
      difficulty: "Easy",
      created_at: "July 31, 2026",
      status: "generating",
    },
    {
      id: "q3",
      title: "Essay - Chapter 3",
      question_count: 5,
      difficulty: "Hard",
      created_at: "July 30, 2026",
      status: "queued",
    },
  ]);
  const [deleteTarget, setDeleteTarget] = useState<GeneratedQuestion | null>(null);
  const addActivity = useActivityStore((s) => s.addActivity);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    addActivity({ action: "deleted", type: "question", name: deleteTarget.title });
    setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="mt-2 flex flex-col gap-3">
      {questions.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {questions.map((q) => (
            <li
              key={q.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 sm:p-4 transition-colors hover:border-secondary/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <FileText className="size-4 sm:size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs sm:text-sm font-semibold text-foreground">{q.title}</p>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground">
                    {q.question_count} questions · {q.difficulty} · {q.created_at}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                <Badge
                  variant="outline"
                  className={`capitalize text-xs px-2 py-0.5 ${STATUS_STYLES[q.status]}`}
                >
                  {q.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Options for ${q.title}`}
                      />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem>
                      <Eye className="size-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="size-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(q)}>
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText className="size-5 text-secondary" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No questions generated yet</EmptyTitle>
            <EmptyDescription>
              Upload source materials first, then generate questions from this folder.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="secondary" disabled>
              <Zap className="size-4" />
              Generate from sources
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {questions.length > 0 && (
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          Questions will appear here after generation completes.
        </p>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question Set</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
