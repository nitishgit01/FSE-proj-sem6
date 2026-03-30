import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as submissionService from '../services/submission.service';
import {
  INDUSTRIES,
  COMPANY_SIZES,
  WORK_MODES,
  GENDERS,
} from '../../../shared/types/index';

// ── Validation Schema ─────────────────────────────────────

const submissionSchema = z.object({
  // Step 1
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  industry: z.enum(INDUSTRIES),
  company: z.string().max(200).optional(),
  companySize: z.enum(COMPANY_SIZES),
  yearsExp: z.number().int().min(0).max(50),

  // Step 2
  baseSalary: z.number().min(1000, 'Salary must be at least 1,000').max(10_000_000, 'Salary cannot exceed 10,000,000'),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code'),
  bonus: z.number().min(0).optional().default(0),
  equity: z.number().min(0).optional().default(0),

  // Step 3
  country: z.string().length(2, 'Country must be a 2-letter ISO code'),
  city: z.string().min(1, 'City is required').max(200),
  workMode: z.enum(WORK_MODES),
  gender: z.enum(GENDERS).optional(),
});

// ── Controller ────────────────────────────────────────────

/**
 * POST /api/submissions
 * Creates a new salary submission. Works for both guests and logged-in users.
 */
export const createSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = submissionSchema.parse(req.body);
    const submission = await submissionService.createSubmission(body, req.user);

    res.status(201).json({
      success: true,
      data: {
        submissionId: submission._id,
        totalComp: submission.totalComp,
        message: 'Your salary has been submitted successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
};
