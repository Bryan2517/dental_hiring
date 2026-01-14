import { Candidate, JobStage } from '../lib/types';
interface KanbanBoardProps {
    candidates: Candidate[];
    onMove: (id: string, status: JobStage) => void;
    onView: (candidate: Candidate) => void;
    favorites?: string[];
    onToggleFavorite?: (id: string) => void;
}
export declare function KanbanBoard({ candidates, onMove, onView, favorites, onToggleFavorite }: KanbanBoardProps): import("react/jsx-runtime").JSX.Element;
export {};
