import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: String,
    university: String,
    year: Number,
  },
  { _id: false }
);

const roleMatchSchema = new mongoose.Schema(
  {
    roleName: String,
    score: Number,
    matchPercentage: Number,
  },
  { _id: false }
);

const parsedSchema = new mongoose.Schema(
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
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },     
    storedFileName: { type: String, required: true }, 
    filePath: { type: String, required: true },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'image'],
      required: true,
    },
    fileSize: { type: Number, required: true },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'ocr', 'parsed', 'failed'],
      default: 'uploaded',
      index: true,
    },
    rawText: { type: String, default: '' },
    parsed: { type: parsedSchema, default: () => ({}) },
    roleMatches: { type: [roleMatchSchema], default: [] },
    error: { type: String, default: null },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true } 
);

resumeSchema.index({ 'parsed.skills': 1 });
resumeSchema.index({ 'parsed.location': 1 });
resumeSchema.index({ 'roleMatches.matchPercentage': -1 });

resumeSchema.index(
  { rawText: 'text', 'parsed.skills': 'text', 'parsed.name': 'text' },
  { name: 'resume_text_index' }
);

export const Resume = mongoose.model('Resume', resumeSchema);