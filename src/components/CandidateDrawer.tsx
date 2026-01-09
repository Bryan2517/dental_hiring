import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { Candidate, JobStage } from '../lib/types';
import { TagPill } from './TagPill';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface CandidateDrawerProps {
  candidate?: Candidate;
  open: boolean;
  onClose: () => void;
  onMove: (id: string, status: JobStage) => void;
}

const actions: JobStage[] = ['Shortlisted', 'Interview', 'Offer', 'Rejected'];

export function CandidateDrawer({ candidate, open, onClose, onMove }: CandidateDrawerProps) {
  if (!open || !candidate) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">{candidate.name}</p>
            <p className="text-sm text-gray-600">
              {candidate.school} - Grad {candidate.gradDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            aria-label="Close candidate drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <p className="text-sm font-semibold text-gray-800">Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <TagPill key={skill} label={skill} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">Resume preview (mock)</p>
            <p className="mt-2 text-xs text-gray-600">
              Placeholder for embedded resume. In this demo, uploads live only in memory.
            </p>
            <div className="mt-3 h-32 rounded-lg border border-dashed border-gray-300 bg-white" />
          </div>
          <Textarea label="Internal notes" placeholder="Add a quick note..." rows={4} />
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action}
                variant={action === 'Rejected' ? 'outline' : 'primary'}
                size="sm"
                onClick={() => onMove(candidate.id, action)}
              >
                Move to {action}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
