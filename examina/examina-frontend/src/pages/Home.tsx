import { useEffect, useState } from "react";
import { checkHealth } from "../api/health";
import type { HealthResponse } from "../types/api";

export default function Home() {
  const [data, setData] = useState<HealthResponse | null>(null);

  useEffect(() => {
    checkHealth()
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Examina</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}