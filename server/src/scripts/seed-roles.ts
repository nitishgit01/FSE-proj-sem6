import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Role } from '../models/Role.model';

/**
 * Seed the roles collection with common job titles and their aliases.
 * Run with: npm run seed
 */
const seedRoles = async () => {
  await connectDB();

  const roles = [
    // Engineering
    {
      canonical: 'Software Engineer',
      aliases: ['SWE', 'Software Developer', 'Developer', 'Programmer', 'Software Dev', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer'],
      category: 'engineering',
    },
    {
      canonical: 'Software Engineer II',
      aliases: ['SWE 2', 'SDE II', 'Dev L2', 'Software Developer II', 'Mid-Level Software Engineer'],
      category: 'engineering',
    },
    {
      canonical: 'Senior Software Engineer',
      aliases: ['Senior SWE', 'Senior Developer', 'Sr. Software Engineer', 'SDE III', 'Staff Engineer', 'Lead Developer'],
      category: 'engineering',
    },
    {
      canonical: 'Principal Engineer',
      aliases: ['Principal SWE', 'Distinguished Engineer', 'Staff Software Engineer'],
      category: 'engineering',
    },
    {
      canonical: 'DevOps Engineer',
      aliases: ['Site Reliability Engineer', 'SRE', 'Platform Engineer', 'Infrastructure Engineer', 'Cloud Engineer'],
      category: 'engineering',
    },
    {
      canonical: 'Mobile Developer',
      aliases: ['iOS Developer', 'Android Developer', 'Mobile Engineer', 'React Native Developer', 'Flutter Developer'],
      category: 'engineering',
    },
    {
      canonical: 'QA Engineer',
      aliases: ['Quality Assurance Engineer', 'Test Engineer', 'SDET', 'Software Tester', 'QA Analyst'],
      category: 'engineering',
    },
    {
      canonical: 'Engineering Manager',
      aliases: ['EM', 'Dev Manager', 'Software Engineering Manager', 'Tech Lead Manager'],
      category: 'engineering',
    },

    // Data
    {
      canonical: 'Data Scientist',
      aliases: ['ML Engineer', 'Machine Learning Engineer', 'AI Engineer', 'Research Scientist'],
      category: 'data',
    },
    {
      canonical: 'Data Analyst',
      aliases: ['Business Analyst', 'Analytics Analyst', 'BI Analyst', 'Reporting Analyst'],
      category: 'data',
    },
    {
      canonical: 'Data Engineer',
      aliases: ['ETL Developer', 'Big Data Engineer', 'Analytics Engineer'],
      category: 'data',
    },

    // Product
    {
      canonical: 'Product Manager',
      aliases: ['PM', 'Product Owner', 'Program Manager', 'Technical Product Manager', 'TPM'],
      category: 'product',
    },
    {
      canonical: 'Project Manager',
      aliases: ['Scrum Master', 'Delivery Manager', 'Program Manager'],
      category: 'product',
    },

    // Design
    {
      canonical: 'UX Designer',
      aliases: ['UI/UX Designer', 'Product Designer', 'Interaction Designer', 'User Experience Designer'],
      category: 'design',
    },
    {
      canonical: 'UI Designer',
      aliases: ['Visual Designer', 'Web Designer', 'Interface Designer'],
      category: 'design',
    },
    {
      canonical: 'Graphic Designer',
      aliases: ['Creative Designer', 'Brand Designer', 'Communication Designer'],
      category: 'design',
    },

    // Marketing
    {
      canonical: 'Marketing Manager',
      aliases: ['Digital Marketing Manager', 'Growth Manager', 'Marketing Lead'],
      category: 'marketing',
    },
    {
      canonical: 'Content Strategist',
      aliases: ['Content Manager', 'Content Writer', 'Copywriter', 'Content Lead'],
      category: 'marketing',
    },
    {
      canonical: 'SEO Specialist',
      aliases: ['SEO Manager', 'Search Engine Optimizer', 'SEO Analyst'],
      category: 'marketing',
    },

    // Finance
    {
      canonical: 'Financial Analyst',
      aliases: ['Finance Analyst', 'FP&A Analyst', 'Investment Analyst'],
      category: 'finance',
    },
    {
      canonical: 'Accountant',
      aliases: ['CPA', 'Tax Accountant', 'Staff Accountant', 'Senior Accountant'],
      category: 'finance',
    },

    // Other
    {
      canonical: 'Human Resources Manager',
      aliases: ['HR Manager', 'People Ops Manager', 'HR Business Partner', 'Talent Manager'],
      category: 'other',
    },
    {
      canonical: 'Sales Representative',
      aliases: ['Account Executive', 'Sales Rep', 'Business Development Rep', 'BDR', 'SDR'],
      category: 'other',
    },
    {
      canonical: 'Customer Success Manager',
      aliases: ['CSM', 'Account Manager', 'Client Success Manager'],
      category: 'other',
    },
  ];

  try {
    // Clear existing roles
    await Role.deleteMany({});
    console.log('🗑️  Cleared existing roles.');

    // Insert seed data
    const result = await Role.insertMany(roles);
    console.log(`✅ Seeded ${result.length} canonical roles with aliases.`);

    // Log summary
    const categories = [...new Set(roles.map((r) => r.category))];
    for (const cat of categories) {
      const count = roles.filter((r) => r.category === cat).length;
      console.log(`   ${cat}: ${count} roles`);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

seedRoles();
