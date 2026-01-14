import { Job, Resume } from '../lib/types';
interface ApplyModalProps {
    open: boolean;
    job?: Job;
    onClose: () => void;
    resumes: Resume[];
}
export declare function ApplyModal({ open, job, onClose, resumes }: ApplyModalProps): import("react/jsx-runtime").JSX.Element;
export {};
