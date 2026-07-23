import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Search() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  return (
    <div className="pb-20 md:pb-6">
      <div className="-mx-4 flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text transition-colors hover:bg-muted-bg"
          aria-label="Back"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <svg className="h-5 w-5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full border-none bg-transparent text-base text-text outline-none placeholder:text-text-muted"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="cursor-pointer rounded-full border-none bg-muted-bg p-1 text-text-muted transition-colors hover:text-text"
              aria-label="Clear"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {!query && (
        <p className="mt-10 text-center text-sm text-text-muted">
          Type to search assessments, materials, and more
        </p>
      )}
    </div>
  );
}
