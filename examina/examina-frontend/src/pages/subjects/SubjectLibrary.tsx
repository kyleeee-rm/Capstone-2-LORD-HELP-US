import { useEffect, useState } from "react";
import { getSubjects, createSubject } from "../../services/subjectService";
import { useNavigate } from "react-router-dom";

export default function SubjectLibrary() {
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getSubjects().then(setSubjects);
  }, []);

  const handleCreate = async () => {
    if (!newSubject) return;
    await createSubject(newSubject);
    setNewSubject("");
    getSubjects().then(setSubjects);
  };

  return (
    <div>
      <h1>Subject Library</h1>

      <input
        value={newSubject}
        onChange={(e) => setNewSubject(e.target.value)}
        placeholder="New Subject"
      />
      <button onClick={handleCreate}>Create</button>

      <ul>
        {subjects.map((s) => (
          <li key={s.id} onClick={() => navigate(`/subjects/${s.id}`)}>
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}