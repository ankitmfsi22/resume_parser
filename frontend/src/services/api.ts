import axios from 'axios';
import type { Insights, Resume, ResumeFilters, ResumeListResponse} from '../types';

const api = axios.create({ baseURL: '/api' });

interface UploadedResume {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
}

export async function uploadResumes(files: File[]): Promise<UploadedResume[]> {
  const form = new FormData();
  for (const file of files) form.append('resumes', file);
  const { data } = await api.post<{ data: UploadedResume[] }>('/upload', form);
  return data.data;
}
function cleanFilters(filters: ResumeFilters): Record<string, string> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value != null),
  ) as Record<string, string>;
}

export async function fetchResumes(filters: ResumeFilters = {}): Promise<ResumeListResponse> {
  const { data } = await api.get<ResumeListResponse>('/resumes', {
    params: cleanFilters(filters),
  });
  return data;
}

export async function fetchResume(id: string): Promise<Resume> {
  const { data } = await api.get<{ data: Resume }>(`/resumes/${id}`);
  return data.data;
}

export async function fetchInsights(): Promise<Insights> {
  const { data } = await api.get<{ data: Insights }>('/insights');
  return data.data;
}
export function csvDownloadUrl(filters: ResumeFilters = {}): string {
  return `/api/export/csv?${new URLSearchParams(cleanFilters(filters)).toString()}`;
}