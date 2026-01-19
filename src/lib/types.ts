export type JobStage =
  | 'Applied'
  | 'Shortlisted'
  | 'Interview'
  | 'Offer'
  | 'Hired'
  | 'Rejected';

export interface Job {
  id: string;
  roleType: string;
  clinicName: string;
  city: string;
  country: string;
  specialtyTags: string[];
  employmentType: 'Full-time' | 'Part-time' | 'Locum' | 'Contract' | 'Internship' | 'Temporary';
  shiftType: 'Day' | 'Night' | 'Rotating';
  salaryRange: string;
  benefits: string[];
  requirements: string[];
  postedAt: string;
  experienceLevel: 'Student' | 'New Grad' | 'Junior' | 'Mid' | 'Senior';
  newGradWelcome: boolean;
  trainingProvided: boolean;
  internshipAvailable: boolean;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  orgId: string;
  logoUrl?: string;
}

export interface Candidate {
  id: string;
  name: string;
  school: string;
  gradDate: string;
  skills: string[];
  status: JobStage;
  rating: number;
  city: string;
  notes?: string;
  interestedIn?: string;
  jobId: string;
  jobTitle: string;
  isFavorite?: boolean;
}


export interface Application {
  id: string;
  jobId: string;
  status: JobStage;
  appliedAt: string;
  candidateName: string;
  jobTitle?: string;
  clinicName?: string;
  location?: string;
}

export interface Resume {
  id: string;
  name: string;
  uploadedAt: string;
  category?: 'Resume' | 'Cover letter' | 'Portfolio' | 'Certificate' | 'Other';
  url?: string;
  isDefault?: boolean;
}
