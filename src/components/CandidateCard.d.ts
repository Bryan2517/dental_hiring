import { Candidate } from '../lib/types';
interface CandidateCardProps {
    candidate: Candidate;
    onView: (candidate: Candidate) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
    draggable?: boolean;
}
export declare function CandidateCard({ candidate, onView, isFavorite, onToggleFavorite, draggable }: CandidateCardProps): import("react/jsx-runtime").JSX.Element;
export {};
