import { useState } from 'react';
import { Plus, UploadCloud } from 'lucide-react';
import { Resume } from '../lib/types';
import { Button } from './ui/button';
import { formatDate } from '../lib/utils';

interface ResumeUploadProps {
  resumes: Resume[];
  onAdd: (resume: Resume) => void;
}

export function ResumeUpload({ resumes, onAdd }: ResumeUploadProps) {
  const [showForm, setShowForm] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleAdd = () => {
    if (!fileName) return;
    const newResume: Resume = {
      id: `res-${Date.now()}`,
      name: fileName,
      uploadedAt: new Date().toISOString().slice(0, 10)
    };
    onAdd(newResume);
    setFileName('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-800">Resumes</h4>
        <Button variant="secondary" size="sm" onClick={() => setShowForm((p) => !p)} icon={<Plus className="h-4 w-4" />}>
          Add resume
        </Button>
      </div>
      <div className="grid gap-3">
        {resumes.map((res) => (
          <div key={res.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm">
            <div>
              <p className="font-semibold text-gray-800">{res.name}</p>
              <p className="text-xs text-gray-500">Uploaded {formatDate(res.uploadedAt)}</p>
            </div>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">Primary</span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4">
          <p className="text-sm font-semibold text-gray-800">Upload resume (mock)</p>
          <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-brand shadow-sm transition hover:bg-brand/10">
            <UploadCloud className="h-4 w-4" />
            <span>{fileName || 'Choose file'}</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const name = e.target.files?.[0]?.name;
                if (name) setFileName(name);
              }}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAdd} disabled={!fileName}>
              Save (mock)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
