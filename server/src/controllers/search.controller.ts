import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Advanced search for persons with multiple filters
export const searchPersons = async (req: Request, res: Response) => {
  try {
    const {
      query,
      firstName,
      lastName,
      email,
      tags,
      fromDate,
      toDate,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};
    const filters: any[] = [];

    // General search query across multiple fields
    if (query) {
      filters.push({
        OR: [
          { firstName: { contains: query as string } },
          { lastName: { contains: query as string } },
          { email: { contains: query as string } },
          { phone: { contains: query as string } },
          { address: { contains: query as string } },
          { tags: { contains: query as string } },
          { notes: { contains: query as string } }
        ]
      });
    }

    // Specific field filters
    if (firstName) {
      filters.push({ firstName: { contains: firstName as string } });
    }

    if (lastName) {
      filters.push({ lastName: { contains: lastName as string } });
    }

    if (email) {
      filters.push({ email: { contains: email as string } });
    }

    if (tags) {
      filters.push({ tags: { contains: tags as string } });
    }

    // Date range filter
    if (fromDate || toDate) {
      const dateFilter: any = {};
      
      if (fromDate) {
        dateFilter.gte = new Date(fromDate as string);
      }
      
      if (toDate) {
        dateFilter.lte = new Date(toDate as string);
      }
      
      filters.push({ createdAt: dateFilter });
    }

    // Combine all filters with AND logic
    if (filters.length > 0) {
      where.AND = filters;
    }

    // Get total count for pagination
    const totalCount = await prisma.person.count({ where });

    // Get persons with pagination and sorting
    const persons = await prisma.person.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      persons,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Search persons error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get person statistics
export const getPersonStats = async (req: Request, res: Response) => {
  try {
    // Total count of persons
    const totalPersons = await prisma.person.count();
    
    // Count persons created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPersons = await prisma.person.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    // Count persons by tags (top 5)
    const personsWithTags = await prisma.person.findMany({
      where: {
        tags: {
          not: null
        }
      },
      select: {
        tags: true
      }
    });
    
    const tagCounts: Record<string, number> = {};
    
    personsWithTags.forEach((person: { tags: string | null }) => {
      if (person.tags) {
        const tags = person.tags.split(',').map(tag => tag.trim());
        tags.forEach(tag => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
    
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    
    return res.status(200).json({
      stats: {
        totalPersons,
        recentPersons,
        topTags
      }
    });
  } catch (error) {
    console.error('Get person stats error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};