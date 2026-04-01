import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Submission } from '../models/Submission.model';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

const seedSubmissions = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 2. Delete all documents in the submissions collection where userId is null
    const deleteResult = await Submission.deleteMany({ userId: null });
    console.log(`Deleted ${deleteResult.deletedCount} anonymous submissions.`);

    // 3. Define the submissions to insert
    const submissionsToInsert: any[] = [];

    // --- GROUP 1: Software Engineer II (8 documents) ---
    const group1Base = {
      jobTitle: "Software Engineer II",
      jobTitleRaw: "Software Engineer II",
      country: "IN",
      city: "Pune",
      workMode: "remote",
      industry: "technology",
      currency: "INR",
      verified: false,
      userId: null,
      skills: ["TypeScript", "React", "Node.js"],
    };

    const group1Data = [
      { baseSalary: 900000, bonus: 90000, equity: 0, yearsExp: 2, companySize: "startup", gender: "man" },
      { baseSalary: 1100000, bonus: 110000, equity: 0, yearsExp: 3, companySize: "mid", gender: "woman" },
      { baseSalary: 1350000, bonus: 135000, equity: 0, yearsExp: 4, companySize: "mid", gender: "man" },
      { baseSalary: 1600000, bonus: 160000, equity: 0, yearsExp: 5, companySize: "enterprise", gender: "prefer_not_to_say" },
      { baseSalary: 1750000, bonus: 175000, equity: 0, yearsExp: 5, companySize: "mid", gender: "man" },
      { baseSalary: 1950000, bonus: 195000, equity: 0, yearsExp: 6, companySize: "startup", gender: "woman" },
      { baseSalary: 2200000, bonus: 220000, equity: 0, yearsExp: 7, companySize: "enterprise", gender: "man" },
      { baseSalary: 2450000, bonus: 245000, equity: 0, yearsExp: 8, companySize: "mid", gender: "woman" },
    ];

    group1Data.forEach(item => {
      const totalComp = item.baseSalary + item.bonus + item.equity;
      const submittedAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      submissionsToInsert.push({ ...group1Base, ...item, totalComp, submittedAt });
    });

    // --- GROUP 2: Product Manager (7 documents) ---
    const group2Base = {
      jobTitle: "Product Manager",
      jobTitleRaw: "Product Manager",
      country: "IN",
      city: "Bangalore",
      workMode: "hybrid",
      industry: "technology",
      currency: "INR",
      verified: false,
      userId: null,
    };

    const group2Data = [
      { baseSalary: 1500000, bonus: 225000, equity: 0, yearsExp: 3, companySize: "mid", gender: "woman" },
      { baseSalary: 1800000, bonus: 270000, equity: 0, yearsExp: 4, companySize: "mid", gender: "man" },
      { baseSalary: 2000000, bonus: 300000, equity: 0, yearsExp: 5, companySize: "enterprise", gender: "man" },
      { baseSalary: 2200000, bonus: 330000, equity: 0, yearsExp: 6, companySize: "mid", gender: "woman" },
      { baseSalary: 2500000, bonus: 375000, equity: 0, yearsExp: 7, companySize: "enterprise", gender: "man" },
      { baseSalary: 2750000, bonus: 412500, equity: 0, yearsExp: 8, companySize: "enterprise", gender: "prefer_not_to_say" },
      { baseSalary: 3100000, bonus: 465000, equity: 0, yearsExp: 10, companySize: "enterprise", gender: "man" },
    ];

    group2Data.forEach(item => {
      const totalComp = item.baseSalary + item.bonus + item.equity;
      const submittedAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      submissionsToInsert.push({ ...group2Base, ...item, totalComp, submittedAt });
    });

    // --- GROUP 3: UX Designer (5 documents) ---
    const group3Base = {
      jobTitle: "UX Designer",
      jobTitleRaw: "UX Designer",
      country: "IN",
      city: "Mumbai",
      workMode: "onsite",
      industry: "design",
      currency: "INR",
      verified: false,
      userId: null,
    };

    const group3Data = [
      { baseSalary: 720000, bonus: 36000, equity: 0, yearsExp: 1, companySize: "startup", gender: "woman" },
      { baseSalary: 900000, bonus: 45000, equity: 0, yearsExp: 2, companySize: "startup", gender: "man" },
      { baseSalary: 1100000, bonus: 55000, equity: 0, yearsExp: 3, companySize: "mid", gender: "woman" },
      { baseSalary: 1300000, bonus: 65000, equity: 0, yearsExp: 5, companySize: "mid", gender: "woman" },
      { baseSalary: 1550000, bonus: 77500, equity: 0, yearsExp: 6, companySize: "enterprise", gender: "man" },
    ];

    group3Data.forEach(item => {
      const totalComp = item.baseSalary + item.bonus + item.equity;
      const submittedAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      submissionsToInsert.push({ ...group3Base, ...item, totalComp, submittedAt });
    });

    // 4. Insert exactly 20 documents
    await Submission.insertMany(submissionsToInsert);

    console.log("Seeded 20 submissions.");
    console.log("Test these filter combos:");
    console.log("  Software Engineer II / IN / Pune / remote → 8 results");
    console.log("  Product Manager / IN / Bangalore / hybrid → 7 results");
    console.log("  UX Designer / IN / Mumbai / onsite → 5 results");

    // 5. Disconnect and exit
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding submissions:', error);
    process.exit(1);
  }
};

seedSubmissions();
