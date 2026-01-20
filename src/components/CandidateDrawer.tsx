import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { updateApplicationNotes } from '../lib/api/applications';
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
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (candidate) {
      setNotes(candidate.notes || '');
    }
  }, [candidate]);

  useEffect(() => {
    async function fetchResumeUrl() {
      if (candidate?.resumePath) {
        setLoadingResume(true);
        try {
          const { data, error } = await supabase.storage
            .from('resumes')
            .createSignedUrl(candidate.resumePath, 3600); // 1 hour expiry

          if (error) throw error;
          setResumeUrl(data.signedUrl);
        } catch (err) {
          console.error('Error fetching resume URL:', err);
        } finally {
          setLoadingResume(false);
        }
      } else {
        setResumeUrl(null);
      }
    }

    if (open && candidate) {
      fetchResumeUrl();
    }
  }, [candidate, open]);

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
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">Resume</p>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:underline flex items-center gap-1"
                >
                  Open in new tab <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {loadingResume ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
                <p className="text-sm text-gray-500">Loading resume...</p>
              </div>
            ) : resumeUrl ? (
              <div className="h-[500px] w-full rounded-lg border border-gray-200 bg-white overflow-hidden">
                {candidate.resumePath?.toLowerCase().endsWith('.pdf') ? (
                  <object
                    data={resumeUrl}
                    type="application/pdf"
                    className="h-full w-full"
                  >
                    <div className="flex h-full flex-col items-center justify-center text-center p-4">
                      <FileText className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">Unable to display PDF directly.</p>
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        Download Resume
                      </a>
                    </div>
                  </object>
                ) : (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
                    className="h-full w-full"
                    title="Resume Preview"
                  />
                )}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
                <FileText className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No resume attached</p>
              </div>
            )}
          </div>
          <Textarea
            label="Internal notes"
            placeholder="Add a quick note..."
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={async () => {
              if (candidate && notes !== candidate.notes) {
                try {
                  await updateApplicationNotes(candidate.id, notes);
                } catch (error) {
                  // handle error silently or show toast
                }
              }
            }}
          />
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
