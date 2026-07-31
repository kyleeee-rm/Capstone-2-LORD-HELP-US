import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";

interface BloomsLevel {
  name: string;
  value: number;
  color: string;
}

interface EditModalProps {
  fileName: string;
  teachingHours: number;
  teachingMinutes: number;
  blooms: BloomsLevel[];
  onSave: (data: { hours: number; minutes: number; blooms: BloomsLevel[] }) => void;
  onClose: () => void;
}

export default function EditModal({
  fileName,
  teachingHours,
  teachingMinutes,
  blooms,
  onSave,
  onClose,
}: EditModalProps) {
  const [hours, setHours] = useState(teachingHours);
  const [minutes, setMinutes] = useState(teachingMinutes);
  const [bloomsState, setBloomsState] = useState(blooms);

  useEffect(() => {
    setHours(teachingHours);
    setMinutes(teachingMinutes);
    setBloomsState(blooms);
  }, [teachingHours, teachingMinutes, blooms]);

  const total = bloomsState.reduce((sum, b) => sum + b.value, 0);

  const handleBloomsChange = (index: number, value: number) => {
    setBloomsState((prev) =>
      prev.map((b, i) => (i === index ? { ...b, value } : b))
    );
  };

  const handleSave = () => {
    onSave({ hours, minutes, blooms: bloomsState });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit "{fileName}"</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="mb-1.5">Hours</Label>
              <Input
                type="number"
                min={0}
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex-1">
              <Label className="mb-1.5">Minutes</Label>
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2">Bloom's Taxonomy Distribution</Label>
            <div className="flex flex-col gap-2">
              {bloomsState.map((b, i) => (
                <div key={b.name} className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="w-20 text-xs font-medium text-text">{b.name}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={b.value}
                    onChange={(e) => handleBloomsChange(i, parseInt(e.target.value) || 0)}
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-current"
                    style={{ accentColor: b.color }}
                  />
                  <span className="w-8 text-right text-xs font-medium text-text">{b.value}%</span>
                </div>
              ))}
            </div>
            <p className={`mt-1.5 text-xs ${total === 100 ? "text-green-600" : "text-destructive"}`}>
              Total: {total}%{total !== 100 && ` (should be 100%)`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
