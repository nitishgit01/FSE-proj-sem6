import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/Role.model';

/**
 * GET /api/roles?q=softw
 * Autocomplete search for canonical role titles.
 * Returns top 10 matching results.
 */
export const searchRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';

    if (!query || query.length < 2) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    // Search by text index (canonical + aliases) OR regex on canonical
    const roles = await Role.find({
      $or: [
        { canonical: { $regex: query, $options: 'i' } },
        { aliases: { $regex: query, $options: 'i' } },
      ],
    })
      .select('canonical category')
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: roles.map((r) => ({
        title: r.canonical,
        category: r.category,
      })),
    });
  } catch (error) {
    next(error);
  }
};
