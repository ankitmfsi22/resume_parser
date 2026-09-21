import { Schema, model } from 'mongoose';

export interface IKeyword {
  keyword: string;
  weight: number;
}

export interface IJobRole {
  name: string;
  keywords: IKeyword[];
  createdAt: Date;
}

const keywordSchema = new Schema<IKeyword>(
  {
    keyword: { type: String, required: true, lowercase: true, trim: true },
    weight: { type: Number, default: 1, min: 1 },
  },
  { _id: false },
);

const jobRoleSchema = new Schema<IJobRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    keywords: { type: [keywordSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const JobRole = model<IJobRole>('JobRole', jobRoleSchema);
