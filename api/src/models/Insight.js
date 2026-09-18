import mongoose from 'mongoose';

const countSchema = (key) =>
  new mongoose.Schema({ [key]: String, count: Number }, { _id: false });

const insightSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },

    topSkills: { type: [countSchema('skill')], default: [] },
    averageExperience: { type: Number, default: 0 },
    commonUniversities: { type: [countSchema('university')], default: [] },

    totalResumes: { type: Number, default: 0 },
    parsedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Insight = mongoose.model('Insight', insightSchema);