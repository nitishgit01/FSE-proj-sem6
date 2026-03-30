/**
 * WageGlass — Role Seed Script
 *
 * Populates the `roles` collection with 50 canonical job titles and
 * realistic aliases covering Indian IT, US startup, and abbreviation
 * naming conventions.
 *
 * Usage:
 *   npm run seed:roles
 *   # or
 *   npx ts-node src/config/seedRoles.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Role } from '../models/Role.model';

// ────────────────────────────────────────────────────────────────────
// 50 Canonical Roles — 7 Categories
// ────────────────────────────────────────────────────────────────────

const roles = [
  // ═══════════════════════════════════════════════════════════════════
  // ENGINEERING — 15 roles
  // ═══════════════════════════════════════════════════════════════════
  {
    canonical: 'Software Engineer I',
    aliases: ['SWE 1', 'SDE I', 'Junior Software Engineer', 'SE1', 'Software Developer I', 'Associate Software Engineer', 'Junior Developer'],
    category: 'engineering',
  },
  {
    canonical: 'Software Engineer II',
    aliases: ['SWE 2', 'SDE II', 'Software Developer II', 'Dev L2', 'Mid-Level Software Engineer', 'Associate Software Engineer', 'SE2'],
    category: 'engineering',
  },
  {
    canonical: 'Software Engineer III',
    aliases: ['SWE 3', 'SDE III', 'Software Developer III', 'SE3', 'Senior Software Developer', 'Module Lead', 'Tech Lead Developer'],
    category: 'engineering',
  },
  {
    canonical: 'Senior Software Engineer',
    aliases: ['Senior SWE', 'Sr. Software Engineer', 'Sr SDE', 'Senior Developer', 'Lead Developer', 'Senior Software Developer', 'SSE'],
    category: 'engineering',
  },
  {
    canonical: 'Staff Software Engineer',
    aliases: ['Staff SWE', 'Staff Engineer', 'L6 Engineer', 'Senior Staff Engineer', 'IC5', 'Lead Engineer'],
    category: 'engineering',
  },
  {
    canonical: 'Principal Software Engineer',
    aliases: ['Principal SWE', 'Principal Engineer', 'Distinguished Engineer', 'L7 Engineer', 'Chief Engineer', 'Architect'],
    category: 'engineering',
  },
  {
    canonical: 'Engineering Manager',
    aliases: ['EM', 'Dev Manager', 'Software Engineering Manager', 'Tech Lead Manager', 'Development Manager', 'Delivery Manager TCS'],
    category: 'engineering',
  },
  {
    canonical: 'Mobile Engineer',
    aliases: ['iOS Developer', 'Android Developer', 'Mobile Developer', 'React Native Developer', 'Flutter Developer', 'Mobile App Developer'],
    category: 'engineering',
  },
  {
    canonical: 'DevOps Engineer',
    aliases: ['Site Reliability Engineer', 'SRE', 'Platform Engineer', 'Infrastructure Engineer', 'Cloud Engineer', 'Release Engineer', 'DevOps Specialist'],
    category: 'engineering',
  },
  {
    canonical: 'Backend Engineer',
    aliases: ['Backend Developer', 'Server-Side Developer', 'API Developer', 'Node.js Developer', 'Java Backend Developer', 'Python Backend Developer'],
    category: 'engineering',
  },
  {
    canonical: 'Frontend Engineer',
    aliases: ['Frontend Developer', 'UI Developer', 'React Developer', 'Angular Developer', 'Web Developer', 'Client-Side Developer'],
    category: 'engineering',
  },
  {
    canonical: 'Full Stack Engineer',
    aliases: ['Full Stack Developer', 'MERN Stack Developer', 'MEAN Stack Developer', 'Fullstack Dev', 'Web Application Developer', 'Full-Stack Software Engineer'],
    category: 'engineering',
  },
  {
    canonical: 'Machine Learning Engineer',
    aliases: ['ML Engineer', 'AI Engineer', 'Deep Learning Engineer', 'Applied ML Engineer', 'NLP Engineer', 'Computer Vision Engineer', 'MLOps Engineer'],
    category: 'engineering',
  },
  {
    canonical: 'Data Engineer',
    aliases: ['ETL Developer', 'Big Data Engineer', 'Data Pipeline Engineer', 'Data Infrastructure Engineer', 'Hadoop Developer', 'Spark Developer'],
    category: 'engineering',
  },
  {
    canonical: 'QA Engineer',
    aliases: ['Quality Assurance Engineer', 'Test Engineer', 'SDET', 'Software Tester', 'QA Analyst', 'Automation Test Engineer', 'Test Lead'],
    category: 'engineering',
  },

  // ═══════════════════════════════════════════════════════════════════
  // DESIGN — 8 roles
  // ═══════════════════════════════════════════════════════════════════
  {
    canonical: 'UX Designer',
    aliases: ['User Experience Designer', 'UXD', 'Interaction Designer', 'Experience Designer', 'UX/UI Designer'],
    category: 'design',
  },
  {
    canonical: 'UI Designer',
    aliases: ['User Interface Designer', 'Visual Designer', 'Web Designer', 'Interface Designer', 'UI/UX Designer'],
    category: 'design',
  },
  {
    canonical: 'Product Designer',
    aliases: ['Digital Product Designer', 'Product Design Lead', 'Senior Product Designer', 'UX Product Designer', 'End-to-End Designer'],
    category: 'design',
  },
  {
    canonical: 'Senior UX Designer',
    aliases: ['Sr UX Designer', 'Lead UX Designer', 'Senior Experience Designer', 'Principal UX Designer', 'Senior Interaction Designer'],
    category: 'design',
  },
  {
    canonical: 'UX Researcher',
    aliases: ['User Researcher', 'Design Researcher', 'UXR', 'User Experience Researcher', 'Usability Researcher'],
    category: 'design',
  },
  {
    canonical: 'Motion Designer',
    aliases: ['Motion Graphics Designer', 'Animation Designer', 'UI Animator', 'Interaction Animator', 'Visual Motion Designer'],
    category: 'design',
  },
  {
    canonical: 'Brand Designer',
    aliases: ['Brand Identity Designer', 'Graphic Designer', 'Creative Designer', 'Visual Brand Designer', 'Communication Designer'],
    category: 'design',
  },
  {
    canonical: 'Design Manager',
    aliases: ['Head of Design', 'Design Lead', 'Design Director', 'UX Manager', 'Creative Director'],
    category: 'design',
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRODUCT — 7 roles
  // ═══════════════════════════════════════════════════════════════════
  {
    canonical: 'Product Manager',
    aliases: ['PM', 'Product Owner', 'PdM', 'Product Lead', 'Product Manager II'],
    category: 'product',
  },
  {
    canonical: 'Senior Product Manager',
    aliases: ['Senior PM', 'Sr PM', 'Sr Product Manager', 'Lead Product Manager', 'Senior Product Owner'],
    category: 'product',
  },
  {
    canonical: 'Principal Product Manager',
    aliases: ['Principal PM', 'Staff PM', 'Staff Product Manager', 'Lead PM', 'Director of Product'],
    category: 'product',
  },
  {
    canonical: 'Group Product Manager',
    aliases: ['Group PM', 'GPM', 'VP Product', 'Head of Product', 'Senior Director Product'],
    category: 'product',
  },
  {
    canonical: 'Technical Product Manager',
    aliases: ['Technical PM', 'TPM', 'Platform PM', 'API Product Manager', 'Infrastructure PM'],
    category: 'product',
  },
  {
    canonical: 'Product Analyst',
    aliases: ['Product Data Analyst', 'Product Analytics Manager', 'Growth Analyst', 'Product Insights Analyst', 'Product Operations Analyst'],
    category: 'product',
  },
  {
    canonical: 'Associate Product Manager',
    aliases: ['APM', 'Junior PM', 'Rotational PM', 'Product Manager Intern', 'Product Associate'],
    category: 'product',
  },

  // ═══════════════════════════════════════════════════════════════════
  // DATA — 7 roles
  // ═══════════════════════════════════════════════════════════════════
  {
    canonical: 'Data Analyst',
    aliases: ['Junior Data Analyst', 'Business Intelligence Analyst', 'Reporting Analyst', 'Insights Analyst', 'Decision Science Analyst'],
    category: 'data',
  },
  {
    canonical: 'Senior Data Analyst',
    aliases: ['Sr Data Analyst', 'Lead Data Analyst', 'Senior BI Analyst', 'Staff Analyst', 'Principal Analyst'],
    category: 'data',
  },
  {
    canonical: 'Data Scientist',
    aliases: ['DS', 'Applied Scientist', 'Research Scientist', 'Quantitative Analyst', 'ML Scientist'],
    category: 'data',
  },
  {
    canonical: 'Senior Data Scientist',
    aliases: ['Sr Data Scientist', 'Lead Data Scientist', 'Staff Data Scientist', 'Principal Data Scientist', 'Senior Applied Scientist'],
    category: 'data',
  },
  {
    canonical: 'BI Analyst',
    aliases: ['Business Intelligence Analyst', 'BI Developer', 'BI Engineer', 'Tableau Developer', 'Power BI Analyst'],
    category: 'data',
  },
  {
    canonical: 'Analytics Engineer',
    aliases: ['Analytics Dev', 'Data Modeler', 'dbt Developer', 'Metrics Engineer', 'Data Analytics Engineer'],
    category: 'data',
  },
  {
    canonical: 'Data Architect',
    aliases: ['Data Platform Architect', 'Cloud Data Architect', 'Enterprise Data Architect', 'Senior Data Engineer', 'Data Solutions Architect'],
    category: 'data',
  },

  // ═══════════════════════════════════════════════════════════════════
  // MARKETING — 5 roles
  // ═══════════════════════════════════════════════════════════════════
  {
    canonical: 'Digital Marketing Manager',
    aliases: ['Digital Marketing Lead', 'Online Marketing Manager', 'Digital Marketing Specialist', 'Performance Marketing Manager', 'Paid Media Manager'],
    category: 'marketing',
  },
  {
    canonical: 'Growth Manager',
    aliases: ['Growth Lead', 'Head of Growth', 'Growth Hacker', 'Growth Marketing Manager', 'User Acquisition Manager'],
    category: 'marketing',
  },
  {
    canonical: 'Content Strategist',
    aliases: ['Content Manager', 'Content Lead', 'Content Writer', 'Copywriter', 'Content Marketing Manager'],
    category: 'marketing',
  },
  {
    canonical: 'Brand Manager',
    aliases: ['Brand Marketing Manager', 'Brand Strategist', 'Brand Lead', 'Consumer Marketing Manager', 'Brand Communications Manager'],
    category: 'marketing',
  },
  {
    canonical: 'SEO Specialist',
    aliases: ['SEO Manager', 'Search Engine Optimizer', 'SEO Analyst', 'Organic Search Specialist', 'SEO Lead'],
    category: 'marketing',
  },

  // ═══════════════════════════════════════════════════════════════════
  // FINANCE — 5 roles
  // ═══════════════════════════════════════════════════════════════════
  {
    canonical: 'Financial Analyst',
    aliases: ['Finance Analyst', 'Junior Financial Analyst', 'FP&A Analyst', 'Corporate Finance Analyst', 'Financial Planning Analyst'],
    category: 'finance',
  },
  {
    canonical: 'Senior Financial Analyst',
    aliases: ['Sr Financial Analyst', 'Lead Financial Analyst', 'Senior FP&A Analyst', 'Senior Finance Analyst', 'Financial Analyst III'],
    category: 'finance',
  },
  {
    canonical: 'FP&A Manager',
    aliases: ['Financial Planning Manager', 'FP&A Lead', 'Finance Manager', 'Planning and Analysis Manager', 'Senior FP&A Manager'],
    category: 'finance',
  },
  {
    canonical: 'Investment Analyst',
    aliases: ['Equity Research Analyst', 'Investment Banking Analyst', 'IB Analyst', 'Venture Capital Analyst', 'Private Equity Analyst'],
    category: 'finance',
  },
  {
    canonical: 'Corporate Finance Manager',
    aliases: ['Corporate Finance Lead', 'Treasury Manager', 'Finance Controller', 'Corporate Finance Director', 'Senior Finance Manager'],
    category: 'finance',
  },

  // ═══════════════════════════════════════════════════════════════════
  // OTHER — 3 roles
  // ═══════════════════════════════════════════════════════════════════
  {
    canonical: 'Operations Manager',
    aliases: ['Ops Manager', 'Business Operations Manager', 'Head of Operations', 'Operations Lead', 'Operations Director'],
    category: 'other',
  },
  {
    canonical: 'Project Manager',
    aliases: ['Scrum Master', 'Agile Coach', 'Program Manager', 'Delivery Manager', 'IT Project Manager', 'PMO Lead'],
    category: 'other',
  },
  {
    canonical: 'Business Analyst',
    aliases: ['BA', 'Systems Analyst', 'Requirements Analyst', 'Functional Analyst', 'Business Systems Analyst', 'Process Analyst'],
    category: 'other',
  },
];

// ────────────────────────────────────────────────────────────────────
// Seed Runner
// ────────────────────────────────────────────────────────────────────

const seed = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not defined. Add it to your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB.\n');

    // ── Drop and recreate ──────────────────────────────────────────
    await Role.collection.drop().catch(() => {
      // Collection may not exist on first run — that's fine.
    });
    console.log('🗑️  Dropped existing roles collection.');

    const result = await Role.insertMany(roles);
    console.log(`✅ Inserted ${result.length} canonical roles.\n`);

    // ── Summary by category ────────────────────────────────────────
    const categories = [...new Set(roles.map((r) => r.category))];
    console.log('📊 Distribution:');
    for (const cat of categories) {
      const count = roles.filter((r) => r.category === cat).length;
      console.log(`   ${cat.padEnd(14)} ${count} roles`);
    }
    console.log(`   ${'─'.repeat(24)}`);
    console.log(`   ${'TOTAL'.padEnd(14)} ${roles.length} roles\n`);

    // ── Verification searches ──────────────────────────────────────
    console.log('🔍 Verification lookups:\n');

    // Search 1: "swe"
    const sweResults = await Role.find({
      $or: [
        { canonical: { $regex: 'swe', $options: 'i' } },
        { aliases: { $regex: 'swe', $options: 'i' } },
      ],
    }).select('canonical').lean();
    console.log(`   "swe" → ${sweResults.length} matches:`);
    sweResults.forEach((r) => console.log(`      • ${r.canonical}`));

    // Search 2: "product"
    const productResults = await Role.find({
      $or: [
        { canonical: { $regex: 'product', $options: 'i' } },
        { aliases: { $regex: 'product', $options: 'i' } },
      ],
    }).select('canonical').lean();
    console.log(`\n   "product" → ${productResults.length} matches:`);
    productResults.forEach((r) => console.log(`      • ${r.canonical}`));

    // Search 3: "analyst"
    const analystResults = await Role.find({
      $or: [
        { canonical: { $regex: 'analyst', $options: 'i' } },
        { aliases: { $regex: 'analyst', $options: 'i' } },
      ],
    }).select('canonical').lean();
    console.log(`\n   "analyst" → ${analystResults.length} matches:`);
    analystResults.forEach((r) => console.log(`      • ${r.canonical}`));

    console.log('\n✅ Seed complete.');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

seed();
