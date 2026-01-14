import { Job } from '../lib/types';
interface JobCardProps {
    job: Job;
    onApply?: (job: Job) => void;
    isSaved?: boolean;
    onToggleSave?: (job: Job) => void;
}
export declare function JobCard({ job, onApply, isSaved, onToggleSave }: JobCardProps): import("react/jsx-runtime").JSX.Element;
export {};
