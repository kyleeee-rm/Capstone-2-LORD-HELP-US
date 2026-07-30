import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function SheetScanning() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)} aria-label="Back">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h1 className="text-2xl font-bold text-text">Sheet Scanning</h1>
      </div>
      <p className="text-sm text-text-muted">This page is under construction.</p>
    </div>
  );
}
