import { Link, useNavigate } from 'react-router-dom';
import type { KeyboardEvent } from 'react';
import { Building2, MapPin, Sparkles, Star, Bookmark, X, Undo2, EyeOff } from 'lucide-react';
import { Job } from '../lib/types';
import { Badge } from './ui/badge';
import { TagPill } from './TagPill';
import { Button } from './ui/button';
import { timeAgo } from '../lib/utils';
import { cn } from '../lib/utils';

interface JobCardProps {
  job: Job;
  onApply?: (job: Job) => void;
  isSaved?: boolean;
  onToggleSave?: (job: Job) => void;
  onHide?: (job: Job) => void;
  isHidden?: boolean;
  onUndo?: () => void;
}

export function JobCard({ job, onApply, isSaved, onToggleSave, onHide, isHidden, onUndo }: JobCardProps) {
  const navigate = useNavigate();
  const goToDetails = () => !isHidden && navigate(`/jobs/${job.id}`);

  if (isHidden) {
    return (
      <div className="relative flex items-center justify-between rounded-3xl border border-gray-100 bg-gray-50/80 p-6 shadow-sm min-h-[160px] animate-in fade-in duration-1000 ease-in-out">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
            <EyeOff className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Job hidden</p>
            <p className="text-sm text-gray-500">We will not show you this job again.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onUndo?.();
          }}
          className="gap-2 bg-white hover:bg-gray-100"
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>
      </div>
    );
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToDetails();
    }
  };

  return (
    <div
      className="relative block rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-brand/30 cursor-pointer group"
      onClick={goToDetails}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {onToggleSave && (
        <div className="absolute top-6 right-16 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job);
            }}
            className={cn(
              "rounded-full p-2 transition-colors hover:bg-gray-100",
              isSaved ? "text-brand" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
          </button>
        </div>
      )}

      {onHide && (
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHide(job);
            }}
            title="Hide this job"
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="float-right ml-4 mb-2 flex flex-col items-end gap-2 text-right">
        {job.logoUrl && (
          <div className="mb-4 h-24 w-24 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm flex items-center justify-center">
            <img
              src={job.logoUrl}
              alt={`${job.clinicName} logo`}
              className="h-full w-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <Badge variant="default" className="text-sm">
          {job.salaryRange}
        </Badge>
        <div className="flex gap-2">
          {job.newGradWelcome && <Badge variant="info">New grad friendly</Badge>}
          {job.trainingProvided && <Badge variant="success">Training provided</Badge>}
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <p className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
          {job.roleType}
          <span className="text-gray-500">- {timeAgo(job.postedAt)}</span>
        </p>
        <h3 className="text-2xl font-bold text-gray-900">{job.clinicName}</h3>
        <div className="flex flex-wrap items-center gap-3 text-base text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-4 w-4 text-brand" />
            {job.employmentType}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-brand" />
            {job.city}, {job.country}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700">
            <Star className="h-4 w-4" />
            {job.experienceLevel}
          </span>
        </div>
      </div>

      <p className="text-base text-gray-700 leading-relaxed mb-4">{job.description}</p>

      <div className="clear-both"></div>

      <div className="flex flex-wrap gap-2">
        {job.specialtyTags.slice(0, 4).map((tag) => (
          <TagPill key={tag} label={tag} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          {job.requirements.slice(0, 2).map((req) => (
            <span key={req} className="rounded-full bg-gray-100 px-3 py-1">
              {req}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/jobs/${job.id}`} onClick={(event) => event.stopPropagation()}>
              Details
            </Link>
          </Button>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<Sparkles className="h-4 w-4" />}
            onClick={(event) => {
              event.stopPropagation();
              onApply?.(job);
            }}
          >
            Quick apply
          </Button>
        </div>
      </div>
    </div>
  );
}
