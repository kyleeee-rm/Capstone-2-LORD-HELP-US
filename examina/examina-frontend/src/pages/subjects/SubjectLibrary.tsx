import { useEffect, useState } from "react";
import { getSubjects, createSubject, type Subject } from "../../services/subjectService";
import { useNavigate } from "react-router-dom";

export default function SubjectLibrary() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [course, setCourse] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => setSubjects([]));
  }, []);

  const handleCreate = async () => {
    if (!subjectCode.trim() || !subjectName.trim()) return;
    try {
      await createSubject({
        subject_code: subjectCode.trim(),
        subject_name: subjectName.trim(),
        course: course.trim(),
        section: section.trim(),
        semester: semester.trim(),
        academic_year: academicYear.trim(),
      });
      setSubjectCode("");
      setSubjectName("");
      setCourse("");
      setSection("");
      setSemester("");
      setAcademicYear("");
      setShowForm(false);
      getSubjects().then(setSubjects);
    } catch {
      // handle error
    }
  };

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Subject Library</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          {showForm ? "Cancel" : "+ New Subject"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-3">
            <input
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              placeholder="Subject code (e.g. CS101)"
              className="rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
            />
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Subject name"
              className="rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Course"
                className="rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
              />
              <input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Section"
                className="rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="Semester"
                className="rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
              />
              <input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Academic Year"
                className="rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!subjectCode.trim() || !subjectName.trim()}
              className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              Create Subject
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {subjects.map((s) => (
          <button
            key={s.subject_id}
            onClick={() => navigate(`/subjects/${s.subject_id}`)}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text">{s.subject_code} - {s.subject_name}</p>
              <p className="text-xs text-text-muted">{s.course} {s.section} | {s.semester} {s.academic_year}</p>
            </div>
            <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
        {subjects.length === 0 && (
          <p className="py-12 text-center text-sm text-text-muted">
            No subjects yet. Create one above.
          </p>
        )}
      </div>
    </div>
  );
}
