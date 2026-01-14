import type { Database } from '../database.types';
import type { Application, Candidate } from '../types';
export declare function getApplications(filters?: {
    job_id?: string;
    org_id?: string;
    seeker_user_id?: string;
    status?: Database['public']['Enums']['application_status'];
}): Promise<Application[]>;
export declare function getCandidatesForOrg(orgId: string): Promise<Candidate[]>;
export declare function createApplication(applicationData: {
    job_id: string;
    org_id: string;
    seeker_user_id: string;
    resume_doc_id?: string;
    cover_letter?: string;
    screening_answers?: any;
    status?: Database['public']['Enums']['application_status'];
}): Promise<Application>;
export declare function updateApplicationStatus(id: string, status: Database['public']['Enums']['application_status'], actorUserId: string): Promise<void>;
