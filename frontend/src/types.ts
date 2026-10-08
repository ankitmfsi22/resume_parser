export type ResumeStatus = 'uploaded' | 'processing' | 'ocr' | 'parsed' | 'failed';

export interface Experience {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
}

export interface Education {
  degree?: string;
  university?: string;
  year?: number;
}

export interface Parsed {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills: string[];
  experience: Experience[];
  totalExperienceYears: number;
  education: Education[];
}

export interface RoleMatch {
  roleName: string;
  score: number;
  matchPercentage: number;
}

export interface Resume {
  _id: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'image';
  status: ResumeStatus;
  rawText?: string;
  parsed: Parsed;
  roleMatches: RoleMatch[];
  error: string | null;
  createdAt: string;
}

export interface Insights {
  topSkills: { skill: string; count: number }[];
  commonUniversities: { university: string; count: number }[];
  topLocations: { location: string; count: number }[];
  experienceDistribution: { range: string; count: number }[];
  roleDistribution: { roleName: string; count: number }[];
  averageExperience: number;
  totalResumes: number;
  parsedCount: number;
  failedCount: number;
}
export interface ResumeFilters {
  keyword?: string;
  location?: string;
  role?: string;
  minScore?: string;
  status?: string;
  skill?: string;
  university?: string;
  minExperience?: string;
  maxExperience?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  order?: string;
}
export interface ResumeListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  count: number;
  data: Resume[];
}
