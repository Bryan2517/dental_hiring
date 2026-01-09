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
  employmentType: 'Full-time' | 'Part-time' | 'Locum' | 'Contract';
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
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  balanceAfter?: number;
}

export interface WalletStats {
  balance: number;
  tier: 'Standard' | 'VIP' | 'Platinum';
  earnedThisMonth: number;
  spentThisMonth: number;
  nextTierIn: number;
  recentTransactions: Array<{
    id: string;
    label: string;
    delta: number;
  }>;
}

export interface Application {
  id: string;
  jobId: string;
  status: JobStage;
  appliedAt: string;
  candidateName: string;
}

export interface Resume {
  id: string;
  name: string;
  uploadedAt: string;
}
