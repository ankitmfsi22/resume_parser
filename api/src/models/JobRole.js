import mongoose from 'mongoose';

const keywordSchema = new mongoose.Schema(
  {
    keyword: { type: String, required: true, lowercase: true, trim: true },
    weight: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const jobRoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    keywords: { type: [keywordSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const JobRole = mongoose.model('JobRole', jobRoleSchema);