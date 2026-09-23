import { Schema, model } from 'mongoose';

export interface ISkillCount {
  skill: string;
  count: number;
}

export interface IUniversityCount {
  university: string;
  count: number;
}

export interface IInsight {
  key: string;
  topSkills: ISkillCount[];
  averageExperience: number;
  commonUniversities: IUniversityCount[];
  totalResumes: number;
  parsedCount: number;
  failedCount: number;
  updatedAt: Date;
}

const skillCountSchema = new Schema<ISkillCount>({ skill: String, count: Number }, { _id: false });

const universityCountSchema = new Schema<IUniversityCount>(
  { university: String, count: Number },
  { _id: false },
);

const insightSchema = new Schema<IInsight>(
  {
    key: { type: String, default: 'global', unique: true },
    topSkills: { type: [skillCountSchema], default: [] },
    averageExperience: { type: Number, default: 0 },
    commonUniversities: { type: [universityCountSchema], default: [] },
    totalResumes: { type: Number, default: 0 },
    parsedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export const Insight = model<IInsight>('Insight', insightSchema);
