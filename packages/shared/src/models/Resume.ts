import { Schema, model } from 'mongoose';

export const RESUME_STATUSES = ['uploaded', 'processing', 'ocr', 'parsed', 'failed'] as const;
export type ResumeStatus = (typeof RESUME_STATUSES)[number];

export const FILE_TYPES = ['pdf', 'docx', 'image'] as const;
export type FileType = (typeof FILE_TYPES)[number];

export interface IExperience {
  company?: string;
  role?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IEducation {
  degree?: string;
  university?: string;
  year?: number;
}

export interface IRoleMatch {
  roleName: string;
  score: number;
  matchPercentage: number;
}

export interface IParsed {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills: string[];
  experience: IExperience[];
  totalExperienceYears: number;
  education: IEducation[];
}

export interface IResume {
  fileName: string;
  storedFileName: string;
  filePath: string;
  fileType: FileType;
  fileSize: number;
  status: ResumeStatus;
  rawText: string;
  parsed: IParsed;
  roleMatches: IRoleMatch[];
  error: string | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<IExperience>(
  { company: String, role: String, startDate: Date, endDate: Date },
  { _id: false },
);

const educationSchema = new Schema<IEducation>(
  { degree: String, university: String, year: Number },
  { _id: false },
);

const roleMatchSchema = new Schema<IRoleMatch>(
  { roleName: String, score: Number, matchPercentage: Number },
  { _id: false },
);

const parsedSchema = new Schema<IParsed>(
  {
    name: String,
    email: String,
    phone: String,
    location: String,
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    totalExperienceYears: { type: Number, default: 0 },
    education: { type: [educationSchema], default: [] },
  },
  { _id: false },
);

const resumeSchema = new Schema<IResume>(
  {
    fileName: { type: String, required: true },
    storedFileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, enum: [...FILE_TYPES], required: true },
    fileSize: { type: Number, required: true },
    status: { type: String, enum: [...RESUME_STATUSES], default: 'uploaded', index: true },
    rawText: { type: String, default: '' },
    parsed: {
      type: parsedSchema,
      default: () => ({ skills: [], experience: [], totalExperienceYears: 0, education: [] }),
    },
    roleMatches: { type: [roleMatchSchema], default: [] },
    error: { type: String, default: null },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

resumeSchema.index({ 'parsed.skills': 1 });
resumeSchema.index({ 'parsed.location': 1 });
resumeSchema.index({ 'roleMatches.matchPercentage': -1 });
resumeSchema.index(
  { rawText: 'text', 'parsed.skills': 'text', 'parsed.name': 'text' },
  { name: 'resume_text_index' },
);

export const Resume = model<IResume>('Resume', resumeSchema);
