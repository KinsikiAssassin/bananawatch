"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";
import { renameTracker } from "@/actions/scan";

export function EditableName({
  trackerId,
  initialName,
}: {
  trackerId: string;
  initialName: string;
}) {
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(name);
  };

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) { cancel(); return; }
    setSaving(true);
    const result = await renameTracker(trackerId, trimmed);
    setSaving(false);
    if (result.success) {
      setName(trimmed);
      setEditing(false);
      toast.success("Name updated");
    } else {
      toast.error(result.error);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          maxLength={50}
          autoFocus
          className="rounded-xl border-2 border-amber-300 bg-white px-3 py-1.5 text-xl font-bold text-amber-900 outline-none focus:border-amber-400"
        />
        <button onClick={save} disabled={saving} className="rounded-full bg-amber-400 p-1.5 text-amber-900 transition active:scale-90 disabled:opacity-50">
          <Check className="h-4 w-4" />
        </button>
        <button onClick={cancel} className="rounded-full bg-gray-100 p-1.5 text-gray-500 transition active:scale-90">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className="flex items-center gap-2 rounded-xl px-1 py-0.5 transition hover:bg-amber-100 active:scale-95"
    >
      <span className="text-xl font-bold text-amber-900">{name}</span>
      <Pencil className="h-4 w-4 text-amber-400" />
    </button>
  );
}
