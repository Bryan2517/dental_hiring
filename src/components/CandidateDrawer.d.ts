import { Candidate, JobStage } from '../lib/types';
interface CandidateDrawerProps {
    candidate?: Candidate;
    open: boolean;
    onClose: () => void;
    onMove: (id: string, status: JobStage) => void;
}
export declare function CandidateDrawer({ candidate, open, onClose, onMove }: CandidateDrawerProps): import("react").ReactPortal;
export {};
