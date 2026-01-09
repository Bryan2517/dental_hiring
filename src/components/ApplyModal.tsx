import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { Toast } from './ui/toast';
import { Job, Resume } from '../lib/types';

interface ApplyModalProps {
  open: boolean;
  job?: Job;
  onClose: () => void;
  resumes: Resume[];
}

export function ApplyModal({ open, job, onClose, resumes }: ApplyModalProps) {
  const [selectedResume, setSelectedResume] = useState<string>(resumes[0]?.id ?? '');
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1500);
  };

  const handleUpload = (fileName: string) => {
    setUploadedFile(fileName);
    setSelectedResume('');
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={`Quick Apply${job ? ` - ${job.roleType}` : ''}`}>
        <div className="space-y-4">
          <Select
            label="Select resume"
            value={selectedResume}
            onChange={(e) => setSelectedResume(e.target.value)}
          >
            <option value="">Choose a resume</option>
            {resumes.map((res) => (
              <option key={res.id} value={res.id}>
                {res.name}
              </option>
            ))}
          </Select>

          <div className="rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4">
            <p className="text-sm font-semibold text-gray-800">Upload a new resume (mock)</p>
            <p className="text-xs text-gray-600">Simulated upload; file stored in local state only.</p>
            <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-brand shadow-sm transition hover:bg-brand/10">
              <UploadCloud className="h-4 w-4" />
              <span>{uploadedFile || 'Choose file'}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const name = e.target.files?.[0]?.name;
                  if (name) handleUpload(name);
                }}
              />
            </label>
          </div>

          <div className="grid gap-3">
            <Textarea
              label="Have you assisted in 4-hand dentistry?"
              placeholder="Share your experience (mock response)"
              value={answers.q1 || ''}
              onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
            />
            <Textarea
              label="Comfort with intraoral scanning?"
              placeholder="IOS brands, number of scans done, etc."
              value={answers.q2 || ''}
              onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Submit application (mock)
            </Button>
          </div>
        </div>
      </Modal>
      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        title="Application submitted (mock)"
        description="The clinic will review your profile in this demo."
        variant="success"
      />
    </>
  );
}
