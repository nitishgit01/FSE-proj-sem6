import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Submission } from '../models/Submission.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI environment variable');
  process.exit(1);
}

const generateDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Spread 20 items roughly evenly over 60 days
const daysSpread = [
  // Group 1 (8 entries)
  3, 10, 17, 24, 31, 38, 45, 52,
  // Group 2 (7 entries)
  5, 14, 23, 32, 41, 50, 59,
  // Group 3 (5 entries)
  8, 20, 32, 44, 56
];

// Helper to create the base defaults and compute totalComp
const createSubmission = (overrides: Record<string, any>, daysAgo: number) => {
  const baseSalary = overrides.baseSalary || 0;
  const bonus = overrides.bonus || 0;
  const equity = overrides.equity || 0;
  const totalComp = baseSalary + bonus + equity;

  return {
    userId: null,
    verified: false,
    submittedAt: generateDate(daysAgo),
    totalComp,
    ...overrides
  };
};

const seedTestSubmissions = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing anonymous submissions to ensure idempotency
    const deleteResult = await Submission.deleteMany({ userId: null });
    console.log(`Deleted ${deleteResult.deletedCount} existing anonymous test submissions.`);

    const submissions = [];

    // GROUP 1 - Software Engineer II (8 submissions)
    const g1Base = [900000, 1100000, 1350000, 1600000, 1750000, 1950000, 2200000, 2450000];
    const g1Sizes = ["startup", "mid", "mid", "enterprise", "mid", "startup", "enterprise", "mid"];
    const g1Exp = [2, 3, 4, 5, 5, 6, 7, 8];
    const g1Gender = ["man", "woman", "man", "prefer_not_to_say", "man", "woman", "man", "woman"];
    const g1Skills = [
      ["TypeScript", "React", "Node.js"],
      ["Java", "Spring", "AWS"],
      ["Python", "Django", "PostgreSQL"],
      ["React", "Redux", "GraphQL"],
      ["Node.js", "Express", "MongoDB"],
      ["Vue.js", "TypeScript"],
      ["Go", "Kubernetes", "Docker"],
      ["React Native", "iOS"]
    ];

    for (let i = 0; i < 8; i++) {
      submissions.push(createSubmission({
        jobTitle: "Software Engineer II",
        jobTitleRaw: "Software Engineer 2", 
        country: "IN",
        city: "Pune",
        workMode: "remote",
        industry: "technology",
        currency: "INR",
        companySize: g1Sizes[i],
        baseSalary: g1Base[i],
        bonus: Math.round(g1Base[i] * 0.1),
        equity: 0,
        yearsExp: g1Exp[i],
        gender: g1Gender[i],
        skills: g1Skills[i]
      }, daysSpread[i]));
    }

    // GROUP 2 - Product Manager (7 submissions)
    const g2Base = [1500000, 1800000, 2000000, 2200000, 2500000, 2750000, 3100000];
    const g2Sizes = ["mid", "mid", "enterprise", "mid", "enterprise", "enterprise", "enterprise"];
    const g2Exp = [3, 4, 5, 6, 7, 8, 10];
    
    for (let i = 0; i < 7; i++) {
      submissions.push(createSubmission({
        jobTitle: "Product Manager",
        jobTitleRaw: "PM",
        country: "IN",
        city: "Bangalore",
        workMode: "hybrid",
        industry: "technology",
        currency: "INR",
        companySize: g2Sizes[i],
        baseSalary: g2Base[i],
        bonus: Math.round(g2Base[i] * 0.15),
        equity: 0,
        yearsExp: g2Exp[i],
        gender: i % 2 === 0 ? "woman" : "man",
        skills: []
      }, daysSpread[8 + i]));
    }

    // GROUP 3 - UX Designer (5 submissions)
    const g3Base = [720000, 900000, 1100000, 1300000, 1550000];
    const g3Sizes = ["startup", "startup", "mid", "mid", "enterprise"];
    const g3Exp = [1, 2, 3, 5, 6];

    for (let i = 0; i < 5; i++) {
      submissions.push(createSubmission({
        jobTitle: "UX Designer",
        jobTitleRaw: "UX/UI Designer",
        country: "IN",
        city: "Mumbai",
        workMode: "onsite",
        industry: "design",
        currency: "INR",
        companySize: g3Sizes[i],
        baseSalary: g3Base[i],
        bonus: Math.round(g3Base[i] * 0.05),
        equity: 0,
        yearsExp: g3Exp[i],
        gender: "woman",
        skills: []
      }, daysSpread[15 + i]));
    }

    await Submission.insertMany(submissions);

    console.log(`
✅ Seeded 20 test submissions. Stats API now has data for:
   • Software Engineer II · IN · Pune · Remote → 8 submissions
   • Product Manager · IN · Bangalore · Hybrid → 7 submissions
   • UX Designer · IN · Mumbai · Onsite → 5 submissions

Run: curl '${process.env.CLIENT_URL || 'http://localhost:5000'}/api/stats?jobTitle=Software+Engineer+II&country=IN&city=Pune&workMode=remote'
Expected response: count:8, insufficient:false, percentiles:{...}
`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

seedTestSubmissions();
