import { Schema, model } from 'mongoose';

export interface ISkillCount {
  skill: string;
  count: number;
}

export interface IUniversityCount {
  university: string;
  count: number;
}

export interface ILocationCount {
  location: string;
  count: number;
}

export interface IExperienceBucket {
  range: string;
  count: number;
}

export interface IRoleCount {
  roleName: string;
  count: number;
}

export interface IInsight {
  key: string;
  topSkills: ISkillCount[];
  commonUniversities: IUniversityCount[];
  topLocations: ILocationCount[];
  experienceDistribution: IExperienceBucket[];
  roleDistribution: IRoleCount[];
  averageExperience: number;
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

const locationCountSchema = new Schema<ILocationCount>(
  { location: String, count: Number },
  { _id: false },
);

const experienceBucketSchema = new Schema<IExperienceBucket>(
  { range: String, count: Number },
  { _id: false },
);

const roleCountSchema = new Schema<IRoleCount>({ roleName: String, count: Number }, { _id: false });

const insightSchema = new Schema<IInsight>(
  {
    key: { type: String, default: 'global', unique: true },
    topSkills: { type: [skillCountSchema], default: [] },
    commonUniversities: { type: [universityCountSchema], default: [] },
    topLocations: { type: [locationCountSchema], default: [] },
    experienceDistribution: { type: [experienceBucketSchema], default: [] },
    roleDistribution: { type: [roleCountSchema], default: [] },
    averageExperience: { type: Number, default: 0 },
    totalResumes: { type: Number, default: 0 },
    parsedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export const Insight = model<IInsight>('Insight', insightSchema);
