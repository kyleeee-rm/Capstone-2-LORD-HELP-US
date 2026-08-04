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
  generating: "border-primary/30 bg-primary/10 text-primary",
  ready: "",
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
        <ul className="flex flex-col gap-3">
          {questions.map((q) => (
            <li
              key={q.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{q.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {q.question_count} questions · {q.difficulty} · {q.created_at}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge
                  variant={q.status === "ready" ? "default" : "outline"}
                  className={`capitalize ${STATUS_STYLES[q.status]}`}
                >
                  {q.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
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
              <FileText className="size-5" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No questions generated yet</EmptyTitle>
            <EmptyDescription>
              Upload source materials first, then generate questions from this folder.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" disabled>
              <Zap className="size-4" />
              Generate from sources
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {questions.length > 0 && (
        <p className="text-xs text-muted-foreground">
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
