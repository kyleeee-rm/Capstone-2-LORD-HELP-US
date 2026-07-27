import { useParams } from "react-router-dom";
import { useState } from "react";
import UploadTab from "./UploadTab";

export default function SubjectFolder() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("materials");

  return (
    <div>
      <h1>Subject Folder</h1>

      <div>
        <button onClick={() => setActiveTab("materials")}>
          Material Sources
        </button>
        <button onClick={() => setActiveTab("questions")}>
          Question Generation
        </button>
      </div>

      {activeTab === "materials" && <UploadTab subjectId={id!} />}
      {activeTab === "questions" && <div>Coming soon...</div>}
    </div>
  );
}